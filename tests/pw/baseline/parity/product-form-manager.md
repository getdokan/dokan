# Parity: product-form-manager

| Legacy test | Title | Verdict |
|---|---|---|
| product-form-manager/newProductForm.spec.ts:32 | vendor can create a simple product with required fields | TODO |
| product-form-manager/newProductForm.spec.ts:40 | vendor can create a product with every option filled | TODO |
| product-form-manager/newProductForm.spec.ts:90 | vendor can save a product as draft | TODO |
| product-form-manager/newProductForm.spec.ts:105 | shows error when title is empty | TODO |
| product-form-manager/newProductForm.spec.ts:117 | shows error when price is empty | TODO |
| product-form-manager/newProductForm.spec.ts:129 | shows error when description is empty | TODO |
| product-form-manager/newProductForm.spec.ts:140 | shows error when no category is selected | TODO |
| product-form-manager/newProductForm.spec.ts:154 | coerces negative price to a non-negative value | TODO |
| product-form-manager/newProductForm.spec.ts:165 | rejects non-numeric price input | TODO |
| product-form-manager/newProductForm.spec.ts:171 | shows error when sale price is greater than regular price | TODO |
| product-form-manager/newProductForm.spec.ts:185 | accepts a valid min/max quantity range | TODO |
| product-form-manager/newProductForm.spec.ts:196 | accepts valid shipping dimensions | TODO |
| product-form-manager/newProductForm.spec.ts:210 | handles a very long title (300+ chars) gracefully | TODO |
| product-form-manager/newProductForm.spec.ts:218 | preserves special characters in the title field | TODO |
| product-form-manager/newProductForm.spec.ts:224 | preserves the title field after a validation error | TODO |
| product-form-manager/newProductForm.spec.ts:242 | toggling downloadable checks the Downloadable option | TODO |
| product-form-manager/newProductForm.spec.ts:247 | toggling virtual checks the Virtual option | TODO |
| product-form-manager/newProductForm.spec.ts:253 | switching to variable type reveals the Attributes section | TODO |
| product-form-manager/newProductForm.spec.ts:265 | accepts a valid GTIN/UPC/EAN | TODO |
| product-form-manager/newProductForm.spec.ts:270 | vendor can fill SKU | TODO |
| product-form-manager/newProductForm.spec.ts:277 | vendor can toggle Manage Stock | TODO |
| product-form-manager/newProductForm.spec.ts:289 | vendor can change product visibility | TODO |
| product-form-manager/newProductForm.spec.ts:294 | vendor can toggle product reviews off | TODO |
| product-form-manager/newProductForm.spec.ts:300 | vendor can fill the purchase note | TODO |
| product-form-manager/newProductForm.spec.ts:314 | vendor can enable wholesale | TODO |
| product-form-manager/newProductForm.spec.ts:321 | vendor can override the default RMA settings | TODO |
| product-form-manager/newProductForm.spec.ts:329 | vendor can enable bulk discount | TODO |
| product-form-manager/newProductForm.spec.ts:346 | vendor can add a feature image | TODO |
| product-form-manager/newProductForm.spec.ts:351 | vendor can add multiple gallery images | TODO |
| product-form-manager/newProductForm.spec.ts:357 | vendor can create and save a product with feature and gallery images | TODO |
| product-form-manager/newProductForm.spec.ts:373 | vendor can remove a feature image after adding it | TODO |
| product-form-manager/newProductForm.spec.ts:381 | vendor can remove a single gallery image while keeping the rest | TODO |
| product-form-manager/newProductForm.spec.ts:445 | vendor can select multiple product categories | TODO |
| product-form-manager/newProductForm.spec.ts:467 | single mode limits the vendor to one product category | TODO |
| product-form-manager/newProductFormAdvanced.spec.ts:27 | toggling downloadable checks the Downloadable option | TODO |
| product-form-manager/newProductFormAdvanced.spec.ts:32 | toggling virtual checks the Virtual option | TODO |
| product-form-manager/newProductFormAdvanced.spec.ts:38 | switching to variable type reveals the Attributes section | TODO |
| product-form-manager/newProductFormAdvanced.spec.ts:50 | accepts a valid GTIN/UPC/EAN | TODO |
| product-form-manager/newProductFormAdvanced.spec.ts:55 | vendor can fill SKU | TODO |
| product-form-manager/newProductFormAdvanced.spec.ts:62 | vendor can toggle Manage Stock | TODO |
| product-form-manager/newProductFormAdvanced.spec.ts:74 | vendor can add a global attribute whose terms lazy-load | TODO |
| product-form-manager/newProductFormAdvanced.spec.ts:91 | vendor can change product visibility | TODO |
| product-form-manager/newProductFormAdvanced.spec.ts:96 | vendor can toggle product reviews off | TODO |
| product-form-manager/newProductFormAdvanced.spec.ts:102 | vendor can fill the purchase note | TODO |
| product-form-manager/newProductFormAdvanced.spec.ts:116 | vendor can enable wholesale | TODO |
| product-form-manager/newProductFormAdvanced.spec.ts:123 | vendor can override the default RMA settings | TODO |
| product-form-manager/newProductFormAdvanced.spec.ts:131 | vendor can enable bulk discount | TODO |
| product-form-manager/newProductFormAuction.spec.ts:41 | offers Simple, Variable, External/Affiliate and Group types | TODO |
| product-form-manager/newProductFormAuction.spec.ts:46 | offers the Auction type when the auction module is active | TODO |
| product-form-manager/newProductFormAuction.spec.ts:50 | selecting Simple keeps the native price field | TODO |
| product-form-manager/newProductFormAuction.spec.ts:55 | selecting Auction swaps the native price for the Auction Options card | TODO |
| product-form-manager/newProductFormAuction.spec.ts:69 | renders every Auction Options field when the auction type is chosen | TODO |
| product-form-manager/newProductFormAuction.spec.ts:81 | vendor can create an auction with the required fields | TODO |
| product-form-manager/newProductFormAuction.spec.ts:97 | vendor can create an auction with every option filled | TODO |
| product-form-manager/newProductFormAuction.spec.ts:119 | hides unrelated fields for the auction type | TODO |
| product-form-manager/newProductFormAuction.spec.ts:129 | keeps the allow-listed fields for the auction type | TODO |
| product-form-manager/newProductFormAuction.spec.ts:144 | reloads saved auction values when the product is re-opened | TODO |
| product-form-manager/newProductFormAuction.spec.ts:173 | blocks save when the start price is missing | TODO |
| product-form-manager/newProductFormAuction.spec.ts:189 | blocks save when the bid increment is missing | TODO |
| product-form-manager/newProductFormAuction.spec.ts:206 | rejects an end date that is not after the start date | TODO |
| product-form-manager/newProductFormEdit.spec.ts:62 | vendor can edit the product title on the edit form (React) | TODO |
| product-form-manager/newProductFormEdit.spec.ts:74 | vendor can set a product price on the edit form (React) | TODO |
| product-form-manager/newProductFormEdit.spec.ts:82 | vendor can add a discount sale price on the edit form (React) | TODO |
| product-form-manager/newProductFormEdit.spec.ts:92 | vendor cannot set a sale price above the regular price (React) | TODO |
| product-form-manager/newProductFormEdit.spec.ts:106 | vendor can edit the short and long descriptions on the edit form (React) | TODO |
| product-form-manager/newProductFormEdit.spec.ts:119 | vendor can make a product virtual on the edit form (React) | TODO |
| product-form-manager/newProductFormEdit.spec.ts:135 | vendor can set the SKU on the edit form (React) | TODO |
| product-form-manager/newProductFormEdit.spec.ts:144 | vendor can set catalog visibility to hidden on the edit form (React) | TODO |
| product-form-manager/newProductFormEdit.spec.ts:152 | vendor can change the product category on the edit form (React) | TODO |
| product-form-manager/newProductFormEdit.spec.ts:164 | vendor can add a feature image on the edit form (React) | TODO |
| product-form-manager/newProductFormTypes.spec.ts:56 | vendor can create a virtual product (React) | TODO |
| product-form-manager/newProductFormValidation.spec.ts:27 | shows error when title is empty | TODO |
| product-form-manager/newProductFormValidation.spec.ts:39 | shows error when price is empty | TODO |
| product-form-manager/newProductFormValidation.spec.ts:51 | shows error when description is empty | TODO |
| product-form-manager/newProductFormValidation.spec.ts:62 | shows error when no category is selected | TODO |
| product-form-manager/newProductFormValidation.spec.ts:76 | coerces negative price to a non-negative value | TODO |
| product-form-manager/newProductFormValidation.spec.ts:87 | rejects non-numeric price input | TODO |
| product-form-manager/newProductFormValidation.spec.ts:93 | shows error when sale price is greater than regular price | TODO |
| product-form-manager/newProductFormValidation.spec.ts:107 | accepts a valid min/max quantity range | TODO |
| product-form-manager/newProductFormValidation.spec.ts:118 | accepts valid shipping dimensions | TODO |
| product-form-manager/newProductFormWholesale.spec.ts:57 | creating a product with wholesale enabled persists _dokan_wholesale_meta (React) | TODO |
| product-form-manager/newProductFormWholesale.spec.ts:100 | a REST-seeded wholesale product hydrates its enabled state in the React editor (React) | TODO |
