import {useImportOnDrop} from "app/features/import/use-import-on-drop"
import showPoolContextMenu from "app/pools/flows/show-pool-context-menu"
import {lakeSearchPath} from "app/router/utils/paths"
import classNames from "classnames"
import React from "react"
import {useDispatch, useSelector} from "react-redux"
import {useHistory} from "react-router"
import styled from "styled-components"
import {
  currentPoolItem,
  poolItem
} from "../../../test/playwright/helpers/locators"
import brim from "../brim"
import FileFilled from "../icons/FileFilled"
import Current from "../state/Current"
import {Pool} from "../state/Pools/types"
import {AppDispatch} from "../state/types"
import {WorkspaceStatus} from "../state/WorkspaceStatuses/types"
import EmptySection from "./common/EmptySection"
import PoolIcon from "./PoolIcon"
import ProgressIndicator from "./ProgressIndicator"

type Props = {
  pools: Pool[]
  workspaceStatus: WorkspaceStatus
}

const NameWrap = styled.div`
  display: flex;
  align-items: center;
  flex: 2;
  overflow: hidden;
`

const PoolListItem = ({pool}: {pool: Pool}) => {
  const dispatch = useDispatch<AppDispatch>()
  const workspaceId = useSelector(Current.getWorkspaceId)
  const currentPoolId = useSelector(Current.getPoolId)

  const p = brim.pool(pool)
  const history = useHistory()
  const onClick = (e) => {
    e.preventDefault()
    history.push(
      lakeSearchPath(p.id, workspaceId, {
        spanArgs: p.empty() ? undefined : p.defaultSpanArgs()
      })
    )
  }

  const progress = p.ingesting() && (
    <div className="small-progress-bar">
      <ProgressIndicator percent={p.ingestProgress()} />
    </div>
  )
  const current = p.id === currentPoolId
  const testProps = current ? currentPoolItem.props : poolItem.props
  return (
    <li>
      <a
        href="#"
        onClick={onClick}
        onContextMenu={() => dispatch(showPoolContextMenu(p))}
        className={classNames("pool-link", {"current-pool-link": current})}
        {...testProps}
      >
        <NameWrap>
          <PoolIcon className="pool-icon" />
          <span className="name">{p.name}</span>
        </NameWrap>
        {progress}
      </a>
    </li>
  )
}

export default function SavedPoolsList({pools, workspaceStatus}: Props) {
  const [, drop] = useImportOnDrop()
  if (workspaceStatus === "disconnected")
    return (
      <EmptySection
        icon={<FileFilled />}
        message="Unable to connect to service."
      />
    )
  if (workspaceStatus === "login-required")
    return (
      <EmptySection
        icon={<FileFilled />}
        message="Login required to view pools."
      />
    )
  if (pools.length === 0)
    return (
      <EmptySection
        icon={<FileFilled />}
        message="You have no pools yet. Create a pool by importing data."
      />
    )

  return (
    <menu className="saved-pools-list" ref={drop}>
      {pools
        .sort((a, b) => (a.name > b.name ? 1 : -1))
        .map((pool) => {
          return <PoolListItem key={pool.id} pool={pool} />
        })}
    </menu>
  )
}
