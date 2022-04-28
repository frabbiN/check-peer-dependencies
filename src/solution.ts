import * as semver from 'semver';
import { exec } from 'shelljs';
import { Dependency, modifiedSemverSatisfies } from './packageUtils';

function semverReverseSort(a, b) {
  const lt = semver.lt(a, b);
  const gt = semver.gt(a, b);
  if (!lt && !gt) {
    return 0;
  } else if (lt) {
    return 1;
  }
  return -1;
}

export interface Resolution {
  problem: Dependency;
  resolution: string;
  resolutionType: 'upgrade' | 'install' | 'devInstall';
}

export function findPossibleResolutions(problems: Dependency[], allPeerDependencies: Dependency[], ): Resolution[] {
  const uniq: Dependency[] = problems.reduce((acc, problem) => (acc.some(dep => (dep.name === problem.name)) || !problem.unmatchedPrerelease) ? acc : acc.concat(problem), []);
  return uniq.map(problem => {
    const shouldUpgrade = !!problem.installedVersion;
    const resolutionType = shouldUpgrade ? 'upgrade' : problem.isPeerDevDependency ? 'devInstall' : 'install';
    const resolutionVersion = findPossibleResolution(problem.name, allPeerDependencies);
    const resolution = resolutionVersion ? `${problem.name}@${semver.minVersion(resolutionVersion)}` : null;

    return { problem, resolution, resolutionType } as Resolution;
  })
}

function findPossibleResolution(packageName, allPeerDeps) {
  const requiredPeerVersions = allPeerDeps.filter(dep => dep.name === packageName);
  // todo: skip this step if only one required peer version and it's an exact version
  try {
    const availableVersions = requiredPeerVersions.reduce( function (allVersions, dep) {
      allVersions.push(dep.version)
      return allVersions
    }, [])
    return availableVersions.find(ver => requiredPeerVersions.every(peerVer => {
      return semver.subset(ver, peerVer.version, { includePrerelease: true });
    }));
  } catch (err) {
    console.error(err);
    console.error();
  }
}
