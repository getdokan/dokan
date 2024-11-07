/**
 * External dependencies
 */
import "@wordpress/notices";
import { createRoot } from "@wordpress/element";

import {
  withCurrentUserHydration,
  withSettingsHydration,
} from "@woocommerce/data";

// import "./stylesheet/_index.scss";
/**
 * Internal dependencies
 */
import "./stylesheets/_index.scss";
import { getAdminSetting } from "reports/utils/admin-settings";
import { PageLayout, EmbedLayout, PrimaryLayout as NoticeArea } from "./layout";
// import "./xstate.js";
import { ErrorBoundary } from "./error-boundary";
// import { error } from "console";
import "./seller-filter";
// const appRoot = document.getElementById("root");
const settingsGroup = "wc_admin";
const hydrateUser = getAdminSetting("currentUserData");
const mountElementId = "dokan-analytics-app";
const appRoot = document.getElementById(mountElementId);

// deriveWpAdminBackgroundColours();

if (appRoot) {
  const root = createRoot(appRoot);

  let HydratedPageLayout = withSettingsHydration(
    settingsGroup,
    window.wcSettings.admin
  )(PageLayout);
  const preloadSettings = window.wcSettings.admin
    ? window.wcSettings.admin.preloadSettings
    : false;
  const hydrateSettings = preloadSettings && preloadSettings.general;

  if (hydrateSettings) {
    HydratedPageLayout = withSettingsHydration("general", {
      general: preloadSettings.general,
    })(HydratedPageLayout);
  }
  if (hydrateUser) {
    HydratedPageLayout =
      withCurrentUserHydration(hydrateUser)(HydratedPageLayout);
  }

  root.render(
    <ErrorBoundary>
      <HydratedPageLayout />
    </ErrorBoundary>
  );
} else {
  console.error(`No DOM found by element ID: ${mountElementId}`);
  //   throw Error("");
}
