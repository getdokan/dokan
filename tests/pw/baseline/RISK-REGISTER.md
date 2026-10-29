# Risk register: new-UI (React) suite

Generated 2026-10-29 by `baseline/baseline.mjs` (git window 180 days, pro repo found).

Risk = impact x likelihood. P0 >= 16, P1 >= 9, else P2. Impact is business judgement (edit `SURFACES`); likelihood comes from commits and fix commits on the surface source.

| Tier | Risk | Surface | Impact | Likelihood | Commits / fixes | Why it matters | Specs today |
|---|---|---|---|---|---|---|---|
| P0 | 25 | Vendor orders | 5 | 5 | 0 / 24 | order status, suborders, refunds, earnings | orders/newOrders.spec.ts<br>orders/newOrdersGaps.spec.ts<br>orders/orders.spec.ts<br>manual-order/newManualOrder.spec.ts |
| P0 | 25 | Vendor subscription | 5 | 5 | 18 / 13 | billing, product limits, pack expiry | vendor-subscriptions/newSubscription.spec.ts |
| P0 | 20 | Product editor | 4 | 5 | 21 / 15 | product data, price, stock, types | product-form-manager/newProductForm.spec.ts<br>product-form-manager/newProductFormAdvanced.spec.ts<br>product-form-manager/newProductFormAuction.spec.ts<br>product-form-manager/newProductFormEdit.spec.ts<br>product-form-manager/newProductFormTypes.spec.ts<br>product-form-manager/newProductFormValidation.spec.ts<br>product-form-manager/newProductFormWholesale.spec.ts<br>vendor-products/addProduct.spec.ts |
| P0 | 16 | Returns / RMA | 4 | 4 | 6 / 13 | refund amounts, warranty | vendor-return-request/newReturnRequest.spec.ts |
| P1 | 15 | Admin settings | 5 | 3 | 1 / 8 | marketplace-wide config, commission, old/new sync | adminSettings/LocationSettings.spec.ts<br>adminSettings/ShipmentShipmentSettings.spec.ts<br>adminSettings/adminSettingsMigration.spec.ts<br>adminSettings/aiContentGeneration.spec.ts<br>adminSettings/colorCustomerPage.spec.ts<br>adminSettings/complianceEuCompliance.spec.ts<br>adminSettings/compliancePrivacy.spec.ts<br>adminSettings/emailVerificationPage.spec.ts<br>adminSettings/generalMarketplace.spec.ts<br>adminSettings/menuManagerPage.spec.ts<br>adminSettings/moderationLivechat.spec.ts<br>adminSettings/moderationReportAbuse.spec.ts<br>adminSettings/moderationRma.spec.ts<br>adminSettings/moderationStoreSupport.spec.ts<br>adminSettings/pageSetup.spec.ts<br>adminSettings/printfulSettings.spec.ts<br>adminSettings/productAdvertisementSettings.spec.ts<br>adminSettings/requestForQuote.spec.ts<br>adminSettings/settingsBridgeSweep.spec.ts<br>adminSettings/settingsCoverage.spec.ts<br>adminSettings/settingsInputValues.spec.ts<br>adminSettings/settingsIsolation.spec.ts<br>adminSettings/shipmentDeliveryTime.spec.ts<br>adminSettings/smsGatewayVerificationPage.spec.ts<br>adminSettings/storePage.spec.ts<br>adminSettings/transactionCommission.spec.ts<br>adminSettings/transactionFees.spec.ts<br>adminSettings/transactionReverseWithdrawal.spec.ts<br>adminSettings/transactionWithdraw.spec.ts<br>adminSettings/vendorSingleProductMultiVendor.spec.ts<br>adminSettings/vendorSocialOnboarding.spec.ts<br>adminSettings/vendorStoreStats.spec.ts<br>adminSettings/vendorVendorCapabilities.spec.ts<br>adminSettings/vendorVendorOnboarding.spec.ts<br>adminSettings/vendorVendorSubscription.spec.ts<br>adminSettings/vendorVerificationPage.spec.ts<br>adminSettings/wholeSaleSetting.spec.ts |
| P1 | 15 | Vendor staff | 5 | 3 | 9 / 6 | capability leaks across staff/vendor | vendor-staff/newVendorStaff.spec.ts |
| P1 | 15 | Auction / booking | 3 | 5 | 16 / 11 | product-type specific pricing | vendor-auction/newAuction.spec.ts<br>vendor-booking/newBooking.spec.ts |
| P1 | 12 | Shipping / table rate | 4 | 3 | 5 / 10 | checkout shipping cost | vendor-shipping/newShipping.spec.ts<br>table-rate-shipping/newShippingRate.spec.ts |
| P1 | 12 | Vendor verification | 3 | 4 | 13 / 10 | gates selling, documents | vendor-verifications/newVendorVerifications.spec.ts |
| P1 | 12 | Request for quote | 3 | 4 | 16 / 9 | quote to order conversion | request-for-quotes/newRequestedQuotes.spec.ts |
| P1 | 9 | Product add-ons | 3 | 3 | 8 / 4 | add-on price at checkout | product-addons/newProductAddons.spec.ts |
| P1 | 5 | Vendor withdraw | 5 | 1 | 4 / 2 | payout amounts, balance, methods | withdraws/newWithdraw.spec.ts<br>withdraws/newWithdrawB15.spec.ts |
| P1 | 5 | Reverse withdrawal | 5 | 1 | 1 / 1 | admin-owed balance, store blocking | reverse-withdraws/newReverseWithdraw.spec.ts |
| P2 | 8 | Admin vendor create/edit | 4 | 2 | 3 / 5 | per-vendor commission, payment info | admin/adminVendorCreate.spec.ts<br>admin/adminVendorEdit.spec.ts<br>admin/adminVendorSingle.spec.ts<br>admin/adminVendors.spec.ts |
| P2 | 8 | Coupons | 4 | 2 | 1 / 4 | discount amounts, eligibility | coupons/newCoupons.spec.ts |
| P2 | 8 | Store support / reviews / QA | 2 | 4 | 10 / 12 | customer communication | store-supports/newStoreSupport.spec.ts<br>store-reviews/newStoreReviews.spec.ts<br>product-qa/newProductQa.spec.ts<br>vendor-support/newVendorSupport.spec.ts |
| P2 | 6 | Products list | 3 | 2 | 8 / 4 | bulk actions, status, delete | products/newProducts.spec.ts<br>products/newProductsProActions.spec.ts |
| P2 | 4 | Vendor store settings | 4 | 1 | 1 / 1 | store profile, payment, catalog mode | vendorStoreSettings/vendorStoreSettingsMigration.spec.ts |
| P2 | 4 | Vendor dashboard home | 2 | 2 | 4 / 5 | stats display | dashboard/dashboard.spec.ts |
| P2 | 3 | Product advertising | 3 | 1 | 6 / 1 | paid ad purchase | product-advertising/newProductAdvertising.spec.ts |
| P2 | 2 | Announcements / badges / social / SEO / followers | 2 | 1 | 2 / 3 | informational | announcements/announcementsNewUI.spec.ts<br>announcements/newAnnouncements.spec.ts<br>seller-badges/newSellerBadge.spec.ts<br>social-linking/newSocial.spec.ts<br>store-seo/newStoreSeo.spec.ts<br>follow-store/newFollowers.spec.ts |

## Next (Phase 0b, per P0 surface)

For each P0 surface, list its failure modes (wrong amount, wrong permission, lost data, broken old/new sync, broken cross-role flow) and mark whether an existing assertion would catch each one. Every uncaught failure mode is a gap. Fill the gaps before touching P1.
