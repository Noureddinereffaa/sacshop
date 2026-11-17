/**
 * Coupons System — Edge Case & Security Tests
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 ADMIN_PASSWORD=yourpass node scripts/test-coupons.js
 *
 * Requires: the 04_coupons_system.sql migration applied and the dev server running.
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "sacshopadmin";

let passed = 0;
let failed = 0;

function check(name, condition, detail = "") {
  if (condition) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function api(path, options = {}, cookie) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...(options.headers || {}),
    },
  });
  let body = null;
  try { body = await res.json(); } catch { /* ignore */ }
  return { status: res.status, body, setCookie: res.headers.get("set-cookie") };
}

async function main() {
  console.log(`\n🧪 Testing coupons system at ${BASE_URL}\n`);

  // ── 0. Admin authentication ──
  console.log("— Admin authentication");
  const login = await api("/api/admin-auth", {
    method: "POST",
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  check("login succeeds", login.body?.success === true, JSON.stringify(login.body));
  const cookie = (login.setCookie || "").split(";")[0];
  check("session cookie issued", cookie.includes("admin_session="));

  const unauthList = await api("/api/coupons");
  check("GET /api/coupons without session → 401", unauthList.status === 401);

  const forgeAttempt = await api("/api/coupons", {}, "admin_session=forged.value");
  check("GET /api/coupons with forged token → 401", forgeAttempt.status === 401);

  // ── 1. Create test coupons ──
  console.log("\n— Coupon creation validation");
  const suffix = Date.now().toString(36).toUpperCase();
  const storeCouponCode = `TEST${suffix}`;

  const badPercent = await api("/api/coupons", {
    method: "POST",
    body: JSON.stringify({ code: "BAD150", discount_type: "percentage", discount_value: 150 }),
  }, cookie);
  check("percentage > 100 rejected", badPercent.status === 400);

  const noProducts = await api("/api/coupons", {
    method: "POST",
    body: JSON.stringify({ code: "NOPROD", discount_type: "fixed", discount_value: 100, scope: "products", product_ids: [] }),
  }, cookie);
  check("product-scoped coupon without products rejected", noProducts.status === 400);

  const created = await api("/api/coupons", {
    method: "POST",
    body: JSON.stringify({
      code: storeCouponCode,
      discount_type: "percentage",
      discount_value: 10,
      min_order_total: 1000,
      is_active: true,
    }),
  }, cookie);
  check("store-wide coupon created", created.status === 201, JSON.stringify(created.body));
  const storeCoupon = created.body;

  const dup = await api("/api/coupons", {
    method: "POST",
    body: JSON.stringify({ code: storeCouponCode.toLowerCase(), discount_type: "percentage", discount_value: 5 }),
  }, cookie);
  check("duplicate code (case-insensitive) rejected", dup.status === 409);

  const capped = await api("/api/coupons", {
    method: "POST",
    body: JSON.stringify({
      code: `CAP${suffix}`,
      discount_type: "percentage",
      discount_value: 50,
      max_discount_amount: 500,
    }),
  }, cookie);
  check("capped percentage coupon created", capped.status === 201);
  const capCoupon = capped.body;

  const scoped = await api("/api/coupons", {
    method: "POST",
    body: JSON.stringify({
      code: `SCOPE${suffix}`,
      discount_type: "fixed",
      discount_value: 200,
      scope: "products",
      product_ids: ["00000000-0000-0000-0000-000000000000"],
    }),
  }, cookie);
  check("product-scoped coupon created", scoped.status === 201);
  const scopeCoupon = scoped.body;

  // ── 2. Validation edge cases ──
  console.log("\n— Coupon validation");
  const cart = [{ productId: "p1", price: 500, quantity: 3 }]; // subtotal 1500

  const wrongCode = await api("/api/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code: "NOSUCHCODE", cart }),
  });
  check("unknown code → invalid", wrongCode.body?.valid === false);

  const belowMin = await api("/api/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code: storeCouponCode, cart: [{ productId: "p1", price: 300, quantity: 1 }] }),
  });
  check("below min_order_total → invalid", belowMin.body?.valid === false, JSON.stringify(belowMin.body));

  const ok = await api("/api/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code: storeCouponCode.toLowerCase(), cart }),
  });
  check("valid coupon (lowercase input) → valid", ok.body?.valid === true, JSON.stringify(ok.body));
  check("discount = 10% of 1500 = 150", ok.body?.coupon?.discount_amount === 150);

  const cappedOk = await api("/api/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code: `cap${suffix}`, cart: [{ productId: "p1", price: 5000, quantity: 1 }] }),
  });
  check("cap enforced (50% of 5000 → 500)", cappedOk.body?.coupon?.discount_amount === 500, JSON.stringify(cappedOk.body));

  const notApplicable = await api("/api/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code: `scope${suffix}`, cart }),
  });
  check("product-scoped coupon with non-matching cart → invalid", notApplicable.body?.valid === false);

  const malformed = await api("/api/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code: storeCouponCode, cart: [{ productId: "p1", price: "abc", quantity: -5 }] }),
  });
  check("malformed cart lines sanitized → empty cart error", malformed.status === 400, JSON.stringify(malformed.body));

  const emptyCart = await api("/api/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code: storeCouponCode, cart: [] }),
  });
  check("empty cart rejected", emptyCart.status === 400);

  const huge = await api("/api/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code: "A".repeat(100), cart }),
  });
  check("oversized code rejected", huge.status === 400);

  // ── 3. Redemption ──
  console.log("\n— Redemption");
  const redeem = await api("/api/coupons/redeem", {
    method: "POST",
    body: JSON.stringify({ coupon_id: storeCoupon.id, order_id: "test-order-1" }),
  });
  check("redeem succeeds", redeem.body?.redeemed === true, JSON.stringify(redeem.body));

  const redeemMissing = await api("/api/coupons/redeem", {
    method: "POST",
    body: JSON.stringify({}),
  });
  check("redeem without ids rejected", redeemMissing.status === 400);

  // ── 4. Cleanup ──
  console.log("\n— Cleanup");
  for (const c of [storeCoupon, capCoupon, scopeCoupon].filter(Boolean)) {
    const del = await api(`/api/coupons/${c.id}`, { method: "DELETE" }, cookie);
    check(`deleted ${c.code}`, del.body?.success === true);
  }

  console.log(`\n═══ Results: ${passed} passed, ${failed} failed ═══\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Test run failed:", err);
  process.exit(1);
});
