/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as alerts from "../alerts.js";
import type * as analytics from "../analytics.js";
import type * as crops from "../crops.js";
import type * as generated_api from "../generated/api.js";
import type * as generated_server from "../generated/server.js";
import type * as logs from "../logs.js";
import type * as soilHealth from "../soilHealth.js";
import type * as user from "../user.js";
import type * as weather from "../weather.js";
import type * as weatherAnalytics from "../weatherAnalytics.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  alerts: typeof alerts;
  analytics: typeof analytics;
  crops: typeof crops;
  "generated/api": typeof generated_api;
  "generated/server": typeof generated_server;
  logs: typeof logs;
  soilHealth: typeof soilHealth;
  user: typeof user;
  weather: typeof weather;
  weatherAnalytics: typeof weatherAnalytics;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
