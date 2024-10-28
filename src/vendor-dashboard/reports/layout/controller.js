/**
 * External dependencies
 */
import { doAction } from '@wordpress/hooks';
import { Suspense, lazy } from "@wordpress/element";
import { useRef, useEffect, useState } from "react";
import { parse, stringify } from "qs";
import { find, isEqual, last, omit } from "lodash";
import {
  applyFilters,
  addAction,
  removeAction,
  didFilter,
} from "@wordpress/hooks";
import { __ } from "@wordpress/i18n";
import {
  getNewPath,
  getPersistedQuery,
  getHistory,
  getQueryExcludedScreens,
  getScreenFromPath,
  isWCAdmin,
} from "@woocommerce/navigation";
import { Spinner } from "@woocommerce/components";

/**
 * Internal dependencies
 */
import { getAdminSetting } from "reports/utils/admin-settings";
import { NoMatch } from "./NoMatch";

const Dashboard = lazy(() =>
  import(/* webpackChunkName: "dashboard" */ "../dashboard")
);
// const Homescreen = lazy(() =>
//   import(/* webpackChunkName: "homescreen" */ "../homescreen")
// );

export const PAGES_FILTER = "dokan_analytics_pages_list";

export const getPages = () => {
  const pages = [];
  const initialBreadcrumbs = [["", getAdminSetting("woocommerceTranslation")]];

  if ( getAdminSetting( 'isAnalyticsEnabled' ) ) {
    pages.push({
      container   : Dashboard,
      path        : "/analytics/overview",
      breadcrumbs : [
        ...initialBreadcrumbs,
        [ "/analytics/overview", __( "Analytics", 'dokan-lite' ) ],
        __( "Overview", 'dokan-lite' ),
      ],
      wpOpenMenu  : "toplevel_page_wc-admin-path--analytics-overview",
      navArgs     : { id : "woocommerce-analytics-overview" },
      capability  : "dokandar",
    });
  }

  /**
   * List of WooCommerce Admin pages.
   *
   * @filter dokan_analytics_pages_list
   * @param {Array.<Object>} pages Array page objects.
   */
  const filteredPages = applyFilters( PAGES_FILTER, pages, getAdminSetting( 'isAnalyticsEnabled' ) );

  filteredPages.push({
    container: NoMatch,
    path: "*",
    breadcrumbs: [...initialBreadcrumbs, __("Not allowed", 'dokan-lite')],
    wpOpenMenu: "toplevel_page_woocommerce",
  });

  return filteredPages;
};

export function usePages() {
  const [pages, setPages] = useState(getPages);

  /*
   * Handler for new pages being added after the initial filter has been run,
   * so that if any routing pages are added later, they can still be rendered
   * instead of falling back to the `NoMatch` page.
   */
  useEffect(() => {
    const handleHookAdded = (hookName) => {
      if (hookName === PAGES_FILTER && didFilter(PAGES_FILTER) > 0) {
        setPages(getPages());
      }
    };

    const namespace = `woocommerce/woocommerce/watch_${PAGES_FILTER}`;
    addAction("hookAdded", namespace, handleHookAdded);

    return () => {
      removeAction("hookAdded", namespace);
    };
  }, []);

  return pages;
}

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export const Controller = ({ ...props }) => {
  const prevProps = usePrevious(props);

  useEffect(() => {
    window.document.documentElement.scrollTop = 0;
    window.document.body.classList.remove("woocommerce-admin-is-loading");
  }, []);

  useEffect(() => {
    if (prevProps) {
      const prevBaseQuery = omit(
        prevProps.query,
        "chartType",
        "filter",
        "paged"
      );
      const baseQuery = omit(props.query, "chartType", "filter", "paged");

      if (prevProps.query.paged > 1 && !isEqual(prevBaseQuery, baseQuery)) {
        getHistory().replace(getNewPath({ paged: 1 }));
      }

      if (prevProps.match.url !== props.match.url) {
        doAction( 'dokan_analytics_route_handler', props.match.url );
        window.document.documentElement.scrollTop = 0;
      }
    }
  }, [props, prevProps]);

  const { page, match, query } = props;
  const { url, params } = match;

  window.wpNavMenuUrlUpdate(query);
  //   window.wpNavMenuClassChange(page, url);

  function getFallback() {
    return page.fallback ? (
      <page.fallback />
    ) : (
      <div className="woocommerce-layout__loading">
        <Spinner />
      </div>
    );
  }

  return (
    <Suspense fallback={getFallback()}>
      <page.container
        params={params}
        path={url}
        pathMatch={page.path}
        query={query}
      />
    </Suspense>
  );
};

/**
 * Update an anchor's link in sidebar to include persisted queries. Leave excluded screens
 * as is.
 *
 * @param {HTMLElement} item            - Sidebar anchor link.
 * @param {Object}      nextQuery       - A query object to be added to updated hrefs.
 * @param {Array}       excludedScreens - wc-admin screens to avoid updating.
 */
export function updateLinkHref(item, nextQuery, excludedScreens) {
  if (isWCAdmin(item.href)) {
    const search = last(item.href.split("?"));
    const query = parse(search);
    const path = query.path || "homescreen";
    const screen = getScreenFromPath(path);

    const isExcludedScreen = excludedScreens.includes(screen);

    const href =
      "admin.php?" +
      stringify(Object.assign(query, isExcludedScreen ? {} : nextQuery));

    // Replace the href so you can see the url on hover.
    item.href = href;

    item.onclick = (e) => {
      e.preventDefault();
      getHistory().push(href);
    };
  }
}

// Update's wc-admin links in wp-admin menu
window.wpNavMenuUrlUpdate = function (query) {
  const nextQuery = getPersistedQuery(query);
  const excludedScreens = getQueryExcludedScreens();
  const anchors = document.querySelectorAll("#adminmenu a");

  Array.from(anchors).forEach((item) =>
    updateLinkHref(item, nextQuery, excludedScreens)
  );
};

// // When the route changes, we need to update wp-admin's menu with the correct section & current link
// window.wpNavMenuClassChange = function (page, url) {
//   const wpNavMenu = document.querySelector("#adminmenu");
//   Array.from(wpNavMenu?.getElementsByClassName("current")).forEach(
//     function (item) {
//       item.classList.remove("current");
//     }
//   );

//   const submenu = Array.from(
//     wpNavMenu?.querySelectorAll(".wp-has-current-submenu")
//   );
//   submenu?.forEach(function (element) {
//     element.classList.remove("wp-has-current-submenu");
//     element.classList.remove("wp-menu-open");
//     element.classList.remove("selected");
//     element.classList.add("wp-not-current-submenu");
//     element.classList.add("menu-top");
//   });

//   const pageUrl =
//     url === "/"
//       ? "admin.php?page=wc-admin"
//       : "admin.php?page=wc-admin&path=" + encodeURIComponent(url);
//   let currentItemsSelector =
//     url === "/"
//       ? `li > a[href$="${pageUrl}"], li > a[href*="${pageUrl}?"]`
//       : `li > a[href*="${pageUrl}"]`;

//   const parentPath = page.navArgs?.parentPath;
//   if (parentPath) {
//     const parentPageUrl =
//       parentPath === "/"
//         ? "admin.php?page=wc-admin"
//         : "admin.php?page=wc-admin&path=" + encodeURIComponent(parentPath);
//     currentItemsSelector += `, li > a[href*="${parentPageUrl}"]`;
//   }

//   const currentItems = wpNavMenu.querySelectorAll(currentItemsSelector);

//   Array.from(currentItems).forEach(function (item) {
//     item.parentElement.classList.add("current");
//   });

//   if (page.wpOpenMenu) {
//     const currentMenu = wpNavMenu.querySelector("#" + page.wpOpenMenu);
//     if (currentMenu) {
//       currentMenu.classList.remove("wp-not-current-submenu");
//       currentMenu.classList.add("wp-has-current-submenu");
//       currentMenu.classList.add("wp-menu-open");
//       currentMenu.classList.add("current");
//     }
//   }

//   const wpWrap = document.querySelector("#wpwrap");
//   wpWrap.classList.remove("wp-responsive-open");
// };
