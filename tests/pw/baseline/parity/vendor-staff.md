# Parity: vendor-staff

| Legacy test | Title | Verdict |
|---|---|---|
| vendor-staff/newVendorStaff.spec.ts:80 | vendor can view the staff list with the seeded staff (React) | OWNED react/vendor-staff/vendorStaff.spec.ts #V13 (own staff row on page 1 of the list) |
| vendor-staff/newVendorStaff.spec.ts:88 | vendor can add a new staff member (React) | REWRITTEN react/vendor-staff/vendorStaff.spec.ts #V9 (REST record fields, under vendor1) |
| vendor-staff/newVendorStaff.spec.ts:104 | vendor can edit a staff member (React) | PORTED react/vendor-staff/vendorStaff.spec.ts #V10 |
| vendor-staff/newVendorStaff.spec.ts:116 | vendor can grant a staff permission (React) | REWRITTEN react/vendor-staff/vendorStaff.spec.ts #V11 (saved and enforced at REST) |
| vendor-staff/newVendorStaff.spec.ts:129 | vendor can reset staff permissions to defaults (React) | PORTED react/vendor-staff/vendorStaff.spec.ts #V12 |
| vendor-staff/newVendorStaff.spec.ts:142 | vendor can delete a staff member (React) | REWRITTEN react/vendor-staff/vendorStaff.spec.ts #V13 (also asserts the account loses access) |
| vendor-staff/newVendorStaff.spec.ts:151 | the staff Name link opens the edit form (React) | DROPPED low risk navigation; the edit form is owned by react/vendor-staff/vendorStaff.spec.ts #V10 |
| vendor-staff/newVendorStaff.spec.ts:158 | the row Actions menu offers Edit / Manage / Delete (React) | DROPPED menu listing; Delete is used by react/vendor-staff/vendorStaff.spec.ts #V13, Edit/Manage screens by #V10/#V11 |
| vendor-staff/newVendorStaff.spec.ts:164 | HashRouter survives a reload on /staffs (React) | DROPPED low risk |
| vendor-staff/newVendorStaff.spec.ts:181 | staff with default permissions sees only permitted menus in the React sidebar (React) | REWRITTEN react/vendor-staff/vendorStaffApi.spec.ts #V1/#V3 (server enforcement) + react/vendor-staff/vendorStaff.spec.ts #V14/#V15 (UI) |
| vendor-staff/newVendorStaff.spec.ts:199 | staff gains a sidebar menu when the vendor grants the capability (React) | REWRITTEN react/vendor-staff/vendorStaffApi.spec.ts #V7 + react/vendor-staff/vendorStaff.spec.ts #V11 (the grant opens the REST area; menu visibility alone protects nothing) |
| vendor-staff/newVendorStaff.spec.ts:218 | staff cannot access the staff-management route (React) | PORTED react/vendor-staff/vendorStaff.spec.ts #V15 |
| vendor-staff/newVendorStaff.spec.ts:239 | deactivating the vendor-staff module removes the Staff route from the vendor dashboard (React) | PORTED react/vendor-staff/vendorStaffModule.global.spec.ts #V16 (plus REST 404) |
