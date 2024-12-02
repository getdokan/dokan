(()=>{var e={7334:e=>{function t(e,t,s){var i,r,a,o,n;function d(){var l=Date.now()-o;l<t&&l>=0?i=setTimeout(d,t-l):(i=null,s||(n=e.apply(a,r),a=r=null))}null==t&&(t=100);var l=function(){a=this,r=arguments,o=Date.now();var l=s&&!i;return i||(i=setTimeout(d,t)),l&&(n=e.apply(a,r),a=r=null),n};return l.clear=function(){i&&(clearTimeout(i),i=null)},l.flush=function(){i&&(n=e.apply(a,r),a=r=null,clearTimeout(i),i=null)},l}t.debounce=t,e.exports=t}},t={};function s(i){var r=t[i];if(void 0!==r)return r.exports;var a=t[i]={exports:{}};return e[i](a,a.exports,s),a.exports}s.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return s.d(t,{a:t}),t},s.d=(e,t)=>{for(var i in t)s.o(t,i)&&!s.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},s.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{"use strict";var e=s(7334),t=s.n(e);function i(e,t,s,i,r,a,o,n){var d,l="function"==typeof e?e.options:e;if(t&&(l.render=t,l.staticRenderFns=s,l._compiled=!0),i&&(l.functional=!0),a&&(l._scopeId="data-v-"+a),o?(d=function(e){(e=e||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(e=__VUE_SSR_CONTEXT__),r&&r.call(this,e),e&&e._registeredComponents&&e._registeredComponents.add(o)},l._ssrRegister=d):r&&(d=n?function(){r.call(this,(l.functional?this.parent:this).$root.$options.shadowRoot)}:r),d)if(l.functional){l._injectStyles=d;var m=l.render;l.render=function(e,t){return d.call(t),m(e,t)}}else{var c=l.beforeCreate;l.beforeCreate=c?[].concat(c,d):[d]}return{exports:e,options:l}}const r=i({name:"CategoryBasedCommission",props:{value:{type:Object,default:{all:{flat:"",percentage:""},items:{}}}},computed:{getCurrencySymbol:()=>window.dokan.currency.symbol?window.dokan.currency.symbol:""},data:()=>({categories:[],renderCategories:[],openRows:[],allCategroyEnabled:!0,commission:{all:{flat:"",percentage:""},items:{}}}),watch:{value(e){"object"==typeof e&&e.hasOwnProperty("all")&&"object"==typeof e.all&&(this.commission.all=e.all),"object"==typeof e&&e.hasOwnProperty("items")&&"object"==typeof e.items&&(this.commission.items=e.items)}},created(){"object"==typeof this.value&&this.value.hasOwnProperty("all")&&"object"==typeof this.value.all&&(this.commission.all=this.value.all),"object"==typeof this.value&&this.value.hasOwnProperty("items")&&!Array.isArray(this.value.items)?this.commission.items=this.value.items:this.commission.items={},dokan.api.get("/products/multistep-categories").then((e=>{"object"==typeof e&&(this.categories=e,this.renderCategories=Object.values(this.getCatgroies()),this.commission.items&&Object.values(this.commission.items).length&&(this.allCategroyEnabled=!1))}))},methods:{getCatgroies(){const e=[],t={};for(const e in this.categories)t[e]=this.categories[e];for(const s in t){const i=t[s];if("0"!==i.parent_id){const s=t[i.parent_id],r=e.indexOf(s);e.splice(r+1,0,i)}else e.push(i)}return e},catRowClick(e,t){if(this.openRows.includes(Number(e.term_id))){let t=this.openRows.indexOf(Number(e.term_id));this.openRows.splice(t,1),this.getChildren(e.term_id).forEach((e=>{let t=this.openRows.indexOf(Number(e));-1!==t&&this.openRows.splice(t,1)}))}else this.openRows.push(Number(e.term_id))},getChildren(e){return Object.values(this.categories).filter((t=>t.parents.includes(Number(e)))).map((e=>e.term_id))},showCatRow(e){return 0===Number(e.parent_id)||this.openRows.includes(Number(e.parent_id))},isOpen(e){this.openRows.push(Number(e))},getCommissionValue(e,t){return this.commission.items.hasOwnProperty(t)?this.commission.items[t][e]:this.commission.all[e]},commissinItemHandler:t()((function(e,t,s,i=""){e="percentage"===t?this.validatePercentage(this.unFormatValue(e)):this.unFormatValue(e);let r=JSON.parse(JSON.stringify(this.commission.items)),a=JSON.parse(JSON.stringify(this.commission.all));r.hasOwnProperty(s)?(a=r[s],a[t]=e,this.$set(this.commission.items,s,a),this.updateChildCommissionValues(s,a),this.deleteDuplicateCategories(this.commission.items)):(a[t]=e,this.$set(this.commission.items,s,a),this.updateChildCommissionValues(s,a),this.deleteDuplicateCategories(this.commission.items)),this.emitComponentChange(JSON.parse(JSON.stringify(this.commission)))}),700),handleAllCategoryInput:t()((function(e,t,s=""){e="percentage"===t?this.validatePercentage(this.unFormatValue(e)):this.unFormatValue(e),this.$set(this.commission.all,t,e),this.$set(this.commission,"items",{}),this.emitComponentChange(JSON.parse(JSON.stringify(this.commission)))}),700),deleteDuplicateCategories(e){let t=this;Object.keys(e).forEach((s=>{t.isEqual(e[s],this.commission.all)&&this.$delete(this.commission.items,s)}))},emitComponentChange(e){this.$emit("change",e)},isEqual(e,t){let s=this;if(e===t)return!0;if(null==e||null==t)return!1;if(typeof e!=typeof t)return!1;if(e instanceof Date&&t instanceof Date)return e.getTime()===t.getTime();if(Array.isArray(e)&&Array.isArray(t)){if(e.length!==t.length)return!1;for(let i=0;i<e.length;i++)if(!s.isEqual(e[i],t[i]))return!1;return!0}if("object"==typeof e&&"object"==typeof t){const i=Object.keys(e),r=Object.keys(t);if(i.length!==r.length)return!1;for(let a of i){if(!r.includes(a))return!1;if(!s.isEqual(e[a],t[a]))return!1}return!0}return!1},updateChildCommissionValues(e,t){let s=this.getChildren(e),i=JSON.parse(JSON.stringify(this.commission.items));s.map((e=>{i[e]=t})),this.$set(this.commission,"items",i)},unFormatValue:e=>""===e?e:String(accounting.unformat(e,dokan.currency.decimal)),formatValue:e=>""===e?e:accounting.formatNumber(e,dokan.currency.precision,dokan.currency.thousand,dokan.currency.decimal),validatePercentage:e=>(""===e||(Number(e)<0||Number(e)>100)&&(e=""),e)}},(function(){var e=this,t=e._self._c;return t("div",{staticClass:"relative"},[t("div",{staticClass:"d-xs:hidden md:flex bg-gray-100 min-h-[3rem] text-gray-500 border-[0.957434px] border-b-0 items-center"},[t("div",{staticClass:"w-1/2 pl-3 flex h-[3rem] items-center border-r-[0.957434px]"},[t("p",{staticClass:"text-xs"},[e._v(e._s(e.__("Category","dokan-lite")))])]),e._v(" "),t("div",{staticClass:"flex w-1/2"},[t("div",{staticClass:"w-1/2 mr-20"},[t("p",{staticClass:"text-xs text-center"},[e._v(e._s(e.__("Percentage","dokan-lite")))])]),e._v(" "),t("div",{staticClass:"w-1/2"},[t("p",{staticClass:"text-xs text-center"},[e._v(e._s(e.__("Flat","dokan-lite")))])])])]),e._v(" "),t("div",{staticClass:"flex flex-col max-h-[500px] overflow-y-auto border-[1px] d-xs:text-[8px] sm:text-[14px] border-[#e9e9ea] border-solid",class:e.allCategroyEnabled?"border-b-0":"border-b-[1px]"},[t("div",{staticClass:"flex flex-row"},[t("div",{staticClass:"flex flex-row w-1/2 items-center min-h-[3rem] border-0 !border-r-[1px] !border-b-[1px] border-[#e9e9ea] border-solid pl-[5px]"},[t("button",{staticClass:"p-1 d-xs:pl-1 md:pl-4 bg-transparent bg-co border-none cursor-pointer",attrs:{type:"button"},on:{click:()=>e.allCategroyEnabled=!e.allCategroyEnabled}},[t("i",{staticClass:"far",class:e.allCategroyEnabled?"fa-plus-square text-[#4C19E6]":"fa-minus-square text-black"})]),e._v(" "),t("p",{staticClass:"d-xs:text-[8px] sm:text-[14px] !m-0"},[e._v(e._s(e.__("All Categories","dokan-lite")))])]),e._v(" "),t("div",{staticClass:"flex flex-row w-1/2 border-0 !border-b-[1px] border-[#e9e9ea] border-solid"},[t("div",{staticClass:"w-1/2 flex justify-start items-center box-border"},[t("input",{ref:"percentage",staticClass:"wc_input_decimal !min-h-full focus:!shadow-none focus:border-transparent !border-0 !w-[100%] !pl-[5px] !pr-0 !pt-0 !pb-0",staticStyle:{border:"none !important"},attrs:{type:"text",id:"percentage_commission",name:"percentage_commission"},domProps:{value:e.formatValue(e.commission.all.percentage)},on:{input:t=>e.handleAllCategoryInput(t.target.value,"percentage",e.commission.all.percentage)}}),e._v(" "),t("div",{staticClass:"h-full d-xs:border-l-0 d-xs:border-r-0 md:border-l-[1px] md:!border-r-[1px] flex justify-center items-center d-xs:!bg-transparent md:!bg-gray-100"},[t("span",{staticClass:"d-xs:pl-1 d-xs:pr-1 md:pl-2 md:pr-2"},[e._v(e._s(e.__("%","dokan-lite")))])])]),e._v(" "),t("div",{staticClass:"h-full border-l-[1px] !border-r-[1px] md:border-0 d-xs:bg-gray-100 md:bg-transparent flex justify-center items-center"},[t("span",{staticClass:"d-xs:p-1 md:p-2"},[e._v(e._s(e.__("+","dokan-lite")))])]),e._v(" "),t("div",{staticClass:"w-1/2 flex justify-start items-center box-border"},[t("div",{staticClass:"h-full d-xs:border-r-0 d-xs:border-l-0 md:!border-r-[1px] md:border-l-[1px] flex justify-center items-center d-xs:!bg-transparent md:!bg-gray-100"},[t("span",{staticClass:"d-xs:pl-1 d-xs:pr-1 md:pl-2 md:pr-2"},[e._v(e._s(e.getCurrencySymbol))])]),e._v(" "),t("input",{ref:"fixed",staticClass:"wc_input_price !min-h-full focus:!shadow-none !border-0 !w-[100%] d-xs:!pl-0 d-xs:!pr-[5px] d-xs:text-right md:text-left md:!pl-[5px] !pr-0 !pt-0 !pb-0",staticStyle:{border:"none !important"},attrs:{type:"text",id:"fixed_commission",name:"fixed_commission"},domProps:{value:e.formatValue(e.commission.all.flat)},on:{input:t=>e.handleAllCategoryInput(t.target.value,"flat",e.commission.all.flat)}})])])]),e._v(" "),e._l(e.renderCategories,(function(s,i){return e.allCategroyEnabled?e._e():t("div",{key:s.term_id,staticClass:"flex flex-row border-0 !border-b-[1px] last:border-b-0 border-[#e9e9ea] border-solid",class:e.showCatRow(s)?"flex":"hidden"},[t("div",{staticClass:"w-1/2 flex flex-row items-center min-h-[3rem] border-0 !border-r-[1px] border-[#e9e9ea] border-solid pl-[5px]"},[t("div",{staticClass:"d-xs:flex h-1/2"},e._l(s.parents,(function(e){return t("span",{key:e,staticClass:"d-xs:bg-[#e5e7eb] md:bg-transparent block h-full w-[1px] d-xs:ml-1"})})),0),e._v(" "),t("button",{staticClass:"p-1 d-xs:pl-1 md:pl-6 bg-transparent border-none cursor-pointer",class:s.children.length?"cursor-pointer text-[#F05025]":"disabled:cursor-not-allowed text-gray-300",attrs:{type:"button",disabled:!s.children.length},on:{click:()=>e.catRowClick(s,i)}},[t("i",{staticClass:"far",class:e.openRows.includes(Number(s.term_id))?"fa-minus-square text-black":"fa-plus-square"})]),e._v(" "),t("p",{staticClass:"d-xs:text-[8px] sm:text-[14px] text-black !m-0"},[t("span",{attrs:{title:s.name},domProps:{innerHTML:e._s(s.name)}}),e._v(" "),t("span",{staticClass:"d-xs:text-[6px] sm:text-[12px] text-gray-500",attrs:{title:e.__("Category ID","dokan")}},[e._v("#"+e._s(s.term_id))])])]),e._v(" "),t("div",{staticClass:"w-1/2 flex min-h-[3rem] border-0 border-solid border-[#e9e9ea]"},[t("div",{staticClass:"w-1/2 flex justify-start items-center box-border"},[t("input",{ref:"percentage",refInFor:!0,staticClass:"wc_input_decimal !min-h-full focus:!shadow-none focus:border-transparent !border-0 !pl-[5px] !pr-0 !pt-0 !pb-0 !w-[100%]",staticStyle:{border:"none !important"},attrs:{type:"text",id:"percentage_commission",name:"percentage_commission"},domProps:{value:e.formatValue(e.getCommissionValue("percentage",s.term_id))},on:{input:t=>e.commissinItemHandler(t.target.value,"percentage",s.term_id,e.getCommissionValue("percentage",s.term_id))}}),e._v(" "),t("div",{staticClass:"h-full d-xs:border-l-0 d-xs:border-r-0 md:border-l-[1px] md:!border-r-[1px] flex justify-center items-center d-xs:!bg-transparent md:!bg-gray-100"},[t("span",{staticClass:"d-xs:pl-1 d-xs:pr-1 md:pl-2 md:pr-2"},[e._v(e._s(e.__("%","dokan-lite")))])])]),e._v(" "),t("div",{staticClass:"h-full border-l-[1px] !border-r-[1px] md:border-0 d-xs:bg-gray-100 md:bg-transparent flex justify-center items-center"},[t("span",{staticClass:"d-xs:p-1 md:p-2"},[e._v(e._s(e.__("+","dokan-lite")))])]),e._v(" "),t("div",{staticClass:"w-1/2 flex justify-start items-center box-border"},[t("div",{staticClass:"h-full d-xs:border-r-0 d-xs:border-l-0 md:!border-r-[1px] md:border-l-[1px] flex justify-center items-center d-xs:!bg-transparent md:!bg-gray-100"},[t("span",{staticClass:"d-xs:pl-1 d-xs:pr-1 md:pl-2 md:pr-2"},[e._v(e._s(e.getCurrencySymbol))])]),e._v(" "),t("input",{ref:"flat",refInFor:!0,staticClass:"wc_input_price !min-h-full focus:!shadow-none !border-0 d-xs:!pl-0 d-xs:!pr-[5px] d-xs:text-right md:text-left md:!pl-[5px] !pr-0 !pt-0 !pb-0 !w-[100%]",staticStyle:{border:"none !important"},attrs:{type:"text",id:"fixed_commission",name:"fixed_commission"},domProps:{value:e.formatValue(e.getCommissionValue("flat",s.term_id))},on:{input:t=>e.commissinItemHandler(t.target.value,"flat",s.term_id,e.getCommissionValue("flat",s.term_id))}})])])])}))],2)])}),[],!1,null,"43cad8b8",null).exports;var a=i({name:"CombineInput",props:{fixedId:{type:String,default:"fixed-val-id"},percentageId:{type:String,default:"percentage-val-id"},fixexName:{type:String,default:"fixed-val-name"},percentageName:{type:String,default:"percentage-val-name"},value:{type:Object,default:{fixed:"",percentage:""}}},data(){var e,t;return{fixed:null!==(e=this.formatPositiveValue(this.value.fixed))&&void 0!==e?e:"",percentage:null!==(t=this.formatPositiveValue(this.value.percentage))&&void 0!==t?t:""}},watch:{value:{handler(e,t){let s=this.validatePercentage(e.percentage),i=this.validatePercentage(t.percentage);(!s||""===s||Number(s)<0||Number(s)>100)&&(s=i),this.fixed=this.formatPositiveValue(e.fixed),this.percentage=this.formatPositiveValue(s)},deep:!0}},methods:{validatePercentage:e=>((Number(e)<0||Number(e)>100)&&(e=""),e),onInput:t()((function(){let e=this,t={fixed:e.fixed?accounting.unformat(e.fixed,dokan.currency.decimal):"",percentage:e.percentage?accounting.unformat(e.percentage,dokan.currency.decimal):""};this.$emit("change",t)}),500),formatPositiveValue:e=>""===e?e:accounting.formatNumber(e,dokan.currency.precision,dokan.currency.thousand,dokan.currency.decimal)},computed:{getCurrencySymbol:()=>window.dokan.currency.symbol}},(function(){var e=this,t=e._self._c;return t("div",{staticClass:"d-xs:text-[8px] sm:text-[14px] d-xs:w-fit sm:w-fit md:w-auto h-[32px] flex d-xs:shadow-md md:shadow-none rounded-[5px]"},[t("div",{staticClass:"md:shadow-md border-[0.957434px] border-[#E9E9E9] d-xs:!border-r-0 md:!border-r-[0.957434px] rounded-[5px] d-xs:!rounded-r-none md:!rounded-r-[5px] !p-0 !m-0 w-[110px] flex justify-start items-center box-border"},[t("input",{directives:[{name:"model",rawName:"v-model",value:e.percentage,expression:"percentage"}],ref:"percentage",staticClass:"wc_input_decimal !border-none focus:!shadow-none !border-0 !w-[100%] !min-h-full !pl-2 !pr-0 !pt-0 !pb-0 min-w-[75px]",staticStyle:{border:"none !important"},attrs:{type:"text",id:e.percentageId,name:e.percentageName},domProps:{value:e.percentage},on:{input:[function(t){t.target.composing||(e.percentage=t.target.value)},e.onInput]}}),e._v(" "),t("div",{staticClass:"d-xs:border-l-0 md:border-l-[0.957434px] flex justify-center items-center d-xs:!bg-transparent md:!bg-gray-100 !min-h-full"},[t("span",{staticClass:"d-xs:pl-1 d-xs:pr-1 md:pl-2 md:pr-2"},[e._v(e._s(e.__("%","dokan-lite")))])])]),e._v(" "),t("div",{staticClass:"d-xs:border-[0.957434px] md:border-0 d-xs:bg-gray-100 md:bg-transparent flex justify-center items-center"},[t("span",{staticClass:"d-xs:p-1 md:p-2"},[e._v(e._s(e.__("+","dokan-lite")))])]),e._v(" "),t("div",{staticClass:"md:shadow-md border-[0.957434px] d-xs:!border-l-0 md:!border-l-[0.957434px] rounded-[5px] d-xs:!rounded-l-none md:!rounded-l-[5px] !p-0 !m-0 w-[110px] flex justify-start items-center box-border"},[t("div",{staticClass:"d-xs:border-r-0 md:border-r-[0.957434px] flex justify-center items-center d-xs:!bg-transparent md:!bg-gray-100 !min-h-full"},[t("span",{staticClass:"d-xs:pl-1 d-xs:pr-1 md:pl-2 md:pr-2"},[e._v(e._s(e.getCurrencySymbol))])]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.fixed,expression:"fixed"}],ref:"fixed",staticClass:"wc_input_price focus:!shadow-none !border-0 !w-[100%] !min-h-full !pl-2 !pr-0 !pt-0 !pb-0 min-w-[75px]",staticStyle:{border:"none !important"},attrs:{type:"text",id:e.fixedId,name:e.fixexName},domProps:{value:e.fixed},on:{input:[function(t){t.target.composing||(e.fixed=t.target.value)},e.onInput]}})])])}),[],!1,null,"7c0c2764",null);const o=i({name:"AdminCommission",components:{CategoryBasedCommission:r,CombineInput:a.exports},data:()=>({selectedCommission:"fixed",commission:{},commissionTypes:{},fixedCommission:{}}),created(){let e=document.getElementById("dokan-setup-wizard-commission-data");if(!e||!e.dataset||!e.dataset.commission)return;let t=JSON.parse(e.dataset.commission);this.commissionTypes=t.dokanCommission,this.fixedCommission.fixed=t.additional_fee?Number(t.additional_fee):0,this.fixedCommission.percentage=t.admin_percentage?Number(t.admin_percentage):0,this.selectedCommission=t.commission_type?String(t.commission_type):"fixed";let s=t.commission_category_based_values;s.all=!s.all||Array.isArray(s.all)?{}:s.all,s.items=!s.items||Array.isArray(s.items)?{}:s.items,this.commission=s},methods:{onCategoryUpdate(e){this.commission=e},fixedCOmmissionhandler(e){var t,s;""===e.fixed&&(e.fixed=null!==(t=this.fixedCommission.fixed)&&void 0!==t?t:0),""===e.percentage&&(e.percentage=null!==(s=this.fixedCommission.percentage)&&void 0!==s?s:0),this.fixedCommission=e}}},(function(){var e,t,s=this,i=s._self._c;return i("div",{staticClass:"p-3"},[i("div",{staticClass:"mb-5"},[i("p",{staticClass:"!p-0 !m-0 !font-semibold",attrs:{for:"_subscription_product_admin_commission_type"}},[s._v(s._s(s.__("Admin Commission type","dokan")))]),s._v(" "),i("div",{staticClass:"flex flex-col"},[i("select",{directives:[{name:"model",rawName:"v-model",value:s.selectedCommission,expression:"selectedCommission"}],staticClass:"select short",attrs:{id:"_subscription_product_admin_commission_type",name:"_subscription_product_admin_commission_type"},on:{change:function(e){var t=Array.prototype.filter.call(e.target.options,(function(e){return e.selected})).map((function(e){return"_value"in e?e._value:e.value}));s.selectedCommission=e.target.multiple?t:t[0]}}},s._l(s.commissionTypes,(function(e,t){return i("option",{domProps:{value:t}},[s._v(s._s(e))])})),0)])]),s._v(" "),"category_based"===s.selectedCommission?i("div",[i("p",{staticClass:"!p-0 !m-0 !font-semibold",attrs:{for:"_subscription_product_admin_commission_type"}},[s._v(s._s(s.__("Admin Commission","dokan")))]),s._v(" "),i("category-based-commission",{attrs:{value:s.commission},on:{change:s.onCategoryUpdate}})],1):"fixed"===s.selectedCommission?i("div",[i("p",{staticClass:"!p-0 !m-0 !font-semibold",attrs:{for:"_subscription_product_admin_commission_type"}},[s._v(s._s(s.__("Admin Commission","dokan")))]),s._v(" "),i("combine-input",{attrs:{value:s.fixedCommission},on:{change:s.fixedCOmmissionhandler}})],1):s._e(),s._v(" "),i("input",{attrs:{type:"hidden",name:"dokan_commission_type"},domProps:{value:s.selectedCommission}}),s._v(" "),i("input",{attrs:{type:"hidden",name:"dokan_commission_flat"},domProps:{value:null!==(e=s.fixedCommission.fixed)&&void 0!==e?e:0}}),s._v(" "),i("input",{attrs:{type:"hidden",name:"dokan_commission_percentage"},domProps:{value:null!==(t=s.fixedCommission.percentage)&&void 0!==t?t:0}}),s._v(" "),i("input",{attrs:{type:"hidden",name:"dokan_commission_category_based"},domProps:{value:JSON.stringify(s.commission)}})])}),[],!1,null,"02cf9e96",null).exports,n=dokan_get_lib("Vue");document.addEventListener("DOMContentLoaded",(function(){document.getElementById("dokan-setup-wizard-commission-wrapper")&&new n({el:"#dokan-setup-wizard-commission-wrapper",render:e=>e(o)})}))})()})();