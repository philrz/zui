import {test} from "@playwright/test"
import TestApp from "../helpers/test-app"
import tmp from "tmp"
const download = require("../../../scripts/util/download")

test.describe("Run Brimcap Queries", () => {
  const app = new TestApp("Run Brimcap Queries")
  const tmpFile = tmp.fileSync()

  test.beforeAll(async () => {
    await download(
      "https://github.com/brimdata/brimcap/blob/main/queries.json?raw=1",
      tmpFile.name
    )

    console.log("Queries saved to: " + tmpFile.name)

    await app.init()
    await app.importQueriesFromFile(tmpFile.name)
  })

  test.afterAll(async () => {
    await app.shutdown()
  })

  test("cases", async () => {
    await app.sleep(1_000)
  })
})
