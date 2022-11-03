import {Pool} from "src/app/core/pools/pool"
import {PoolName} from "./pool-name"

export type Internal = {
  id: string
  group: string[]
  name: string
  children: (Pool | Internal)[]
}

export function groupByDelimeter(data: Pool[], delimeter: string) {
  const tree: (Pool | Internal)[] = []
  for (let pool of data) {
    const poolName = new PoolName(pool.name, delimeter)
    let siblings = tree
    poolName.parts
      .map((t) => t.trim())
      .forEach((name, index, array) => {
        const group = array.slice(0, index + 1)
        const id = group.join(delimeter)
        const isLeaf = array.length - 1 === index
        if (isLeaf) {
          siblings.push(pool)
        } else {
          let node = siblings.find((n) => n.id === id) as Internal
          if (!node) {
            node = {id, name, group, children: []}
            siblings.push(node)
          }
          siblings = node.children
        }
      })
  }
  return tree
}
