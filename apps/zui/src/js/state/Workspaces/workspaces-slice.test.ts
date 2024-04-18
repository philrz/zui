/** @jest-environment jsdom */

import initTestStore from "src/test/unit/helpers/initTestStore"
import Workspaces from "./index"

test("hi", async () => {
  const store = await initTestStore()
  console.log(
    store.dispatch(
      Workspaces.create({name: "hello", path: "hi", id: "1", openedAt: "1"})
    )
  )
  console.log(Workspaces.all(store.getState()))
})
