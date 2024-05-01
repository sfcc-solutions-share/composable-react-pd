/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Interface with github rest APIs to avoid requiring unique 3rd party github actions
 */

const https = require('https')
const fs = require('fs')
const semver = require('semver')

function urlToFile(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filename)
        const request = https.get(url, function (response) {
            response.pipe(file)
            file.on('finish', () => {
                file.close(resolve)
            })
        })
        request.on('error', (e) => {
            fs.unlink(filename)
            reject(e)
        })
    })
}

exports.downloadReleaseAsset = async ({github, context, tag, owner, repo, assetName}) => {
    if (!repo) {
        repo = context.repo.repo
    }
    if (!owner) {
        owner = context.repo.owner
    }

    const release = await github.rest.repos.getReleaseByTag({
        owner,
        repo,
        tag
    })
    if (!release || !release.data) {
        console.log('Cannot find release')
        return
    }
    var releaseData = release.data
    const cartridgeAsset = releaseData.assets.find((a) => a.name === assetName)

    if (cartridgeAsset) {
        var data = await github.rest.repos.getReleaseAsset({
            headers: {
                Accept: 'application/octet-stream'
            },
            owner: owner,
            repo: repo,
            asset_id: cartridgeAsset.id
        })
        // will return an object with a signed URL
        await urlToFile(data.url, assetName)
    } else {
        console.error('Cannot find asset ' + assetName)
    }
}

/**
 * Get the latest published release by semver; no draft or prerelease
 *
 * Github doesn't make this easy and considers the "latest" to be by create date not semver
 *
 * @param github
 * @param context
 * @returns {Promise<string>}
 */
exports.getLatestRelease = async ({github, context, ...rest}) => {
    const {repo = context.repo.repo, owner = context.repo.owner} = rest
    var data = await github.paginate('GET /repos/{owner}/{repo}/releases', {
        owner: owner,
        repo: repo
    })

    data = data.filter((r) => !r.draft && !r.prerelease)
    data.sort((a, b) => semver.gt(semver.clean(a.tag_name), semver.clean(b.tag_name)))

    var latest = data.shift()
    return latest.tag_name
}
