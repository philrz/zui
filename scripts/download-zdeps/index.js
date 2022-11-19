/* @noflow */

const child_process = require("child_process")
const download = require("../util/download")
const fs = require("fs-extra")
const path = require("path")
const tmp = require("tmp")
const brimPackage = require("../../package.json")
const decompress = require("decompress")
const zdepsPath = path.resolve("zdeps")

const platformDefs = {
  darwin: {
    zqBin: "zq",
    zedBin: "zed",
    osarch: "darwin-amd64",
    ext: "tar.gz",
  },
  linux: {
    zqBin: "zq",
    zedBin: "zed",
    osarch: "linux-amd64",
    ext: "tar.gz",
  },
  win32: {
    zqBin: "zq.exe",
    zedBin: "zed.exe",
    osarch: "windows-amd64",
    ext: "zip",
  },
}

async function unzipTo(zipfile, dir) {
  await fs.mkdirp(dir)
  await decompress(zipfile, dir)
}

function zedArtifactPaths(version) {
  const plat = platformDefs[process.platform]

  const artifactFile = `zed-${version}.${plat.osarch}.${plat.ext}`
  const artifactUrl = `https://github.com/brimdata/zed/releases/download/${version}/${artifactFile}`

  return {
    artifactFile,
    artifactUrl,
  }
}

// Download and extract the zed binary for this platform to the specified
// directory. Returns the absolute path of the zed binary file.
async function zedArtifactsDownload(version, destPath) {
  const plat = platformDefs[process.platform]
  const paths = zedArtifactPaths(version)

  const tmpdir = tmp.dirSync({unsafeCleanup: true})
  try {
    const destArchive = path.join(tmpdir.name, paths.artifactFile)
    await download(paths.artifactUrl, destArchive)
    await unzipTo(destArchive, tmpdir.name)
    console.log("Download and unzip success")
    fs.mkdirpSync(destPath)

    for (let f of [plat.zqBin, plat.zedBin]) {
      fs.moveSync(path.join(tmpdir.name, f), path.join(destPath, f), {
        overwrite: true,
      })
    }
  } finally {
    tmpdir.removeCallback()
  }
}

async function zedDevBuild(destPath) {
  if (!(process.platform in platformDefs)) {
    throw new Error("unsupported platform")
  }
  const plat = platformDefs[process.platform]

  const zedPackageDir = path.join(__dirname, "..", "..", "node_modules", "zed")

  fs.mkdirpSync(destPath)

  for (let f of [plat.zqBin, plat.zedBin]) {
    fs.copyFileSync(path.join(zedPackageDir, "dist", f), path.join(destPath, f))
  }
}

async function main() {
  try {
    fs.copySync(
      path.resolve("node_modules", "brimcap", "build", "dist"),
      zdepsPath
    )
    const brimcapVersion = child_process
      .execSync(path.join(zdepsPath, "brimcap") + " -version")
      .toString()
      .trim()
    console.log("copied brimcap artifacts " + brimcapVersion)

    // The Zed dependency should be a git tag or commit. Any tag that
    // begins with "v*" is expected to be a released artifact, and will
    // be downloaded from the Zed repository. Otherwise, copy Zed
    // artifacts from node_modules via zedDevBuild.
    const zedVersion = brimPackage.dependencies.zed.split("#")[1]
    if (zedVersion.startsWith("v")) {
      await zedArtifactsDownload(zedVersion, zdepsPath)
      console.log("downloaded Zed artifacts version " + zedVersion)
    } else {
      await zedDevBuild(zdepsPath)
      // Print the version inside zq derived during prepack as
      // opposed to what's in package.json.
      let realZqVersion = child_process
        .execSync(path.join(zdepsPath, "zq") + " -version")
        .toString()
        .trim()
      console.log("copied Zed artifacts " + realZqVersion)
    }
  } catch (err) {
    console.error("zdeps setup: ", err)
    process.exit(1)
  }
}

main()
