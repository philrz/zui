import env from "src/app/core/env"
import {MainObject} from "../core/main/main-object"
import ConfigPropValues from "src/js/state/ConfigPropValues"
import {Scheduler} from "src/domain/updates/scheduler"
import {check} from "src/domain/updates/operations"
import {select} from "src/core/main/select"
import {info} from "src/core/log"
import {app} from "electron"

export function initialize(_main: MainObject) {
  if (env.isTest) {
    info("Not Checking for Updates when env.isTest")
    return
  }

  const mode = select(ConfigPropValues.get("application", "updateMode"))
  const schedule = new Scheduler()
  app.whenReady().then(() => {
    setTimeout(() => {
      info("Starting updater in mode: ", mode)
      schedule.start(mode, check)
    }, 15_000) // wait 15 seconds before checking for updates
  })
}
