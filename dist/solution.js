"use strict";
exports.__esModule = true;
exports.findPossibleResolutions = void 0;
var semver = require("semver");
var shelljs_1 = require("shelljs");
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
        var resolution = resolutionVersion ? "".concat(problem.name, "@").concat(getVersion(problem.name, resolutionVersion)) : null;
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
            return semver.subset(ver, peerVer.version, { includePrerelease: true });
        }); });
    }
    catch (err) {
        console.error(err);
        console.error();
    }
}
function getVersion(name, resolutionVersion) {
    if (resolutionVersion === '*') {
        try {
            var command = "npm view ".concat(name, " version");
            var rawVersionsInfo = (0, shelljs_1.exec)(command, { silent: true }).stdout;
            return rawVersionsInfo;
        }
        catch (err) {
            console.error(err);
        }
    }
    return semver.minVersion(resolutionVersion);
}
