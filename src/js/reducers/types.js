/* @flow */

import {type Store as ReduxStore} from "redux"

import type {Analysis} from "./analysis"
import type {BoomSearches} from "./boomSearches"
import type {Boomd} from "./boomd"
import type {Descriptors} from "./descriptors"
import type {FilterTree} from "./filterTree"
import type {Histogram} from "./histogram"
import type {LogDetails} from "./logDetails"
import type {LogViewer} from "./logViewer"
import type {Logs} from "./logs"
import type {Notifications} from "./notifications"
import type {SearchBar} from "./searchBar"
import type {SearchHistory} from "./searchHistory"
import type {Spaces} from "./spaces"
import type {TableColumnSets} from "./tableColumnSets"
import type {TimeWindow} from "./timeWindow"
import type {View} from "./view"
import type {Whois} from "./whois"
import type {Correlations} from "./correlations"
import BoomClient from "../BoomClient"

export type State = {
  correlations: Correlations,
  analysis: Analysis,
  histogram: Histogram,
  searchBar: SearchBar,
  timeWindow: TimeWindow,
  spaces: Spaces,
  boomd: Boomd,
  logViewer: LogViewer,
  searchHistory: SearchHistory,
  whois: Whois,
  logDetails: LogDetails,
  filterTree: FilterTree,
  descriptors: Descriptors,
  view: View,
  notifications: Notifications,
  tableColumnSets: TableColumnSets,
  logs: Logs,
  boomSearches: BoomSearches
}

export type GetState = () => State
export type Thunk = (Dispatch, GetState, BoomClient) => any
export type Action = {type: string}
export type Dispatch = (Action | Thunk) => *
export type Api = BoomClient
export type DispatchProps = {|dispatch: Dispatch|}
export type Store = ReduxStore<State, *>
