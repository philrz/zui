import {Abortables} from "src/app/core/models/abortables"
import * as remote from "@electron/remote"
import path from "path"
import toast from "react-hot-toast"
import ingestFiles from "src/app/features/import/import-files"
import errors from "../errors"
import {getZealot} from "../flows/getZealot"
import ErrorFactory from "../models/ErrorFactory"
import Notice from "../state/Notice"
import {AppDispatch, State} from "../state/types"
import {
  CommandRegistry,
  ContextMenuRegistry,
  DetailCtxItemBuilder,
  LoaderRegistry,
  SearchCtxItemBuilder,
} from "./registries"
import {StorageApi} from "./storage"
import {ConfigsApi, ToolbarApi} from "./ui-apis"
import {syncPoolsData} from "src/app/core/pools/sync-pools-data"
import {QueriesApi} from "./queries/queries-api"

export default class BrimApi {
  public abortables = new Abortables()
  public commands = new CommandRegistry()
  public loaders = new LoaderRegistry()
  public contextMenus = {
    search: new ContextMenuRegistry<SearchCtxItemBuilder>(),
    detail: new ContextMenuRegistry<DetailCtxItemBuilder>(),
  }
  public toolbar: ToolbarApi
  public configs: ConfigsApi
  public storage: StorageApi
  public queries: QueriesApi

  public toast = toast

  /*
  TODO: store is made public only to make the initial plugin architecture
    migration easier, it will eventually be private
   */
  public dispatch: AppDispatch
  public getState: () => State

  constructor() {}

  init(d: AppDispatch, gs: () => State) {
    this.dispatch = d
    this.getState = gs

    this.toolbar = new ToolbarApi(d, gs)
    this.configs = new ConfigsApi(d, gs)
    this.storage = new StorageApi(d, gs)
    this.queries = new QueriesApi(d)
  }

  getZealot() {
    return this.dispatch(getZealot())
  }

  getTempDir() {
    return remote.app.getPath("temp")
  }

  getAppConfig() {
    return {
      dataRoot: path.join(remote.app.getPath("userData"), "data"),
      zdepsDirectory: path.join(
        remote.app.getAppPath().replace("app.asar", "app.asar.unpacked"),
        "zdeps"
      ),
    }
  }

  import(files: File[]): Promise<void> {
    return this.dispatch(ingestFiles(files))
      .then(() => {
        toast.success("Import complete.")
      })
      .catch((e) => {
        const cause = e.cause
        if (/(Failed to fetch)|(network error)/.test(cause.message)) {
          this.dispatch(Notice.set(errors.importInterrupt()))
        } else if (/format detection error/i.test(cause.message)) {
          this.dispatch(Notice.set(errors.formatDetection(cause.message)))
        } else {
          this.dispatch(Notice.set(ErrorFactory.create(e.cause)))
        }
        this.dispatch(syncPoolsData()).catch((e) => e)
        console.error(e.message)
      })
  }
}
