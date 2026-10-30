# Failure modes: Vendor staff (P1 by score, impact 5)

Pro module `modules/vendor-staff`. React: `/dashboard/new/#/staffs` (list), `/staffs/create`, `/staffs/update/:id`, `/staffs/permissions/:id`. REST: `dokan/v1/vendor-staff`.

The risk is enforcement: a staff member must get exactly the vendor-granted capabilities at the **server**, never more, and never across vendors. Hiding a menu is not protection.

Paths are relative to `tests/pw/tests/react/vendor-staff/`.

| # | Failure mode | Role | Layer | Assertion | Verdict |
|---|---|---|---|---|---|
| V1 | Staff without order permissions lists, reads or changes orders (orders #14) | staff | API | `vendorStaffApi.spec.ts` #V1 (list/read/update 403, order unchanged) | caught |
| V2 | Staff sees another vendor's orders | staff | API | #V2 (list excludes, read by id refused) | caught |
| V3 | Staff reaches withdraw or staff management by default | staff | API | #V3 | caught |
| V4 | Staff grants itself a permission (privilege escalation) | staff | API | #V4 (403, capability unchanged) | caught |
| V5 | Another vendor reads, changes or deletes the vendor's staff | vendor | API | #V5 (403/4xx, record and capabilities unchanged) | caught |
| V6 | Customer or guest reaches staff REST | customer/guest | API | #V6 | caught |
| V7 | A granted permission does not open the REST area | staff | API | #V7 (withdraw 403 → 200) | caught |
| V8 | Staff with default permissions cannot open one of its vendor's orders by id | staff | API | #V8 v1 + v2 `test.fail`: **product bug**, FINDINGS #6 | bug pinned |
| V9 | Created staff is not saved, or saved under the wrong vendor | vendor | UI + REST | `vendorStaff.spec.ts` #V9 | caught |
| V10 | Staff edit not saved | vendor | UI + REST | #V10 | caught |
| V11 | Permission granted in the UI is not saved or not enforced | vendor/staff | UI + REST | #V11 | caught |
| V12 | Reset does not restore defaults | vendor | UI + REST | #V12 | caught |
| V13 | Deleted staff keeps access | vendor/staff | UI + REST | #V13 (gone from the list; its credentials are refused) | caught |
| V14 | Restricted staff still sees and opens the orders screen | staff | UI | #V14 (no Orders menu, Permission Denied, no rows) | caught |
| V15 | Staff opens staff management in the UI | staff | UI | #V15 | caught |
| V16 | Module off but Staff screen or REST still reachable | vendor | UI + API | `vendorStaffModule.global.spec.ts` #V16 (REST 404, no menu, no list) | caught |
| V17 | Staff acting on products, coupons or withdraws beyond its capabilities | staff | API | none (orders and withdraw covered; products and coupons not) | **GAP** |
| V18 | Staff export/notes capabilities (`dokan_export_order`, `dokan_manage_order_note`) enforced | staff | API | none | **GAP** |

## Open (in order)

1. V17: revoke product capabilities, then assert product create/update/delete are 403.
2. V18: export and order-note capabilities.
