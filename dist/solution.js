"use strict";
exports.__esModule = true;
exports.findPossibleResolutions = void 0;
var semver = require("semver");
function semverReverseSort(a, b) {
    var lt = semver.lt(a, b);
    var gt = semver.gt(a, b);
    if (!lt && !gt) {
        return 0;
    }
    else if (lt) {
        return 1;
    }
    return -1;
}
function findPossibleResolutions(problems, allPeerDependencies) {
    var uniq = problems.reduce(function (acc, problem) { return (acc.some(function (dep) { return (dep.name === problem.name); }) || !problem.unmatchedPrerelease) ? acc : acc.concat(problem); }, []);
    return uniq.map(function (problem) {
        var shouldUpgrade = !!problem.installedVersion;
        var resolutionType = shouldUpgrade ? 'upgrade' : problem.isPeerDevDependency ? 'devInstall' : 'install';
        var resolutionVersion = findPossibleResolution(problem.name, allPeerDependencies);
        var resolution = resolutionVersion ? "".concat(problem.name, "@").concat(semver.minVersion(resolutionVersion)) : null;
        return { problem: problem, resolution: resolution, resolutionType: resolutionType };
    });
}
exports.findPossibleResolutions = findPossibleResolutions;
function findPossibleResolution(packageName, allPeerDeps) {
    var requiredPeerVersions = allPeerDeps.filter(function (dep) { return dep.name === packageName; });
    // todo: skip this step if only one required peer version and it's an exact version
    try {
        var availableVersions = requiredPeerVersions.reduce(function (allVersions, dep) {
            allVersions.push(dep.version);
            return allVersions;
        }, []);
        return availableVersions.find(function (ver) { return requiredPeerVersions.every(function (peerVer) {
            return semver.subset(ver, peerVer.version);
        }); });
    }
    catch (err) {
        console.error(err);
        console.error();
    }
}
