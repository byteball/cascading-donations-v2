"use server";

interface packageDependencies {
  name: string;
  repo?: string;
}

export const getPackageDependencies = async (fullName: string) => {
  const result: packageDependencies[] = [];
  const getters: Promise<void>[] = [];

  try {
    if (fullName) {
      const packageData = await fetch(`https://cdn.jsdelivr.net/gh/${fullName}@latest/package.json`);
      const packageDependencies: packageDependencies = await packageData.json().then((data) => ({...(data.dependencies || {}), ...(data.devDependencies || {})})).catch(() => ({}));

      Object.entries(packageDependencies).slice(0, 50).forEach(([packageName, linkOrVersion]) => {

        if (linkOrVersion.includes("https://github.com") && linkOrVersion.endsWith('.git')) {
          const repoName = transformUrlToRepoFullName(linkOrVersion);
          // direct link to the github repository // EXAMPLE: https://github.com/byteball/ocore
          result.push({ name: '', repo: repoName });
        } if (linkOrVersion.includes("github:") || linkOrVersion.includes("github.com:")) {
          result.push({ name: '' + packageName, repo: linkOrVersion.split(":")[1] });
        } if (packageName.startsWith("git@github.com:")) {
          result.push({ name: packageName, repo: linkOrVersion.split(":")[1] });
        } else {
          getters.push(getRepoFullNameByPackageName(packageName).then((repoName) => {
            if(!repoName?.startsWith('packages/')) {
              result.push({ name: packageName, repo: repoName || "" });
            }
          }));
        }
      });

      await Promise.all(getters);
    } else {
      throw new Error('Invalid repo name');
    }
  } catch (e) {
    console.error('error: getPackageDependencies', e)
  }

  return result;
}

export const getRepoFullNameByPackageName = async (packageName: string) => {
  try {
    const packageDataResponse = await fetch(`https://cdn.jsdelivr.net/npm/${packageName}/package.json`);
    const packageData = await packageDataResponse.json();

    if (typeof packageData.repository === "string") {
      if (packageData.repository.startsWith("https://github.com/")) {
        return transformUrlToRepoFullName(packageData.repository);
      } else if (packageData.repository.includes("github")) {
        return transformUrlToRepoFullName(packageData.repository);
      } else {
        return null;
      }

    } else if (typeof packageData.repository === "object" && packageData.repository.url) {

      if (packageData.repository.url.includes("github")) {
        return transformUrlToRepoFullName(packageData.repository.url);
      }

      return null;

    }

  } catch {
    return null;
  }

}

export const transformUrlToRepoFullName = (url: string) => {
  let nameWithoutProtocol = '';

  if (url.startsWith("git@github.com:")) {
    nameWithoutProtocol = url.replace('git@github.com:', '')
  } else if (url.startsWith("git://github.com/")) {
    nameWithoutProtocol = url.replace("git://github.com/", '')
  } else if (url.startsWith("github:")) {
    nameWithoutProtocol = url.replace('github:', '')
  } else {
    const linkOrVersionSplit = url.split("/");
    nameWithoutProtocol = linkOrVersionSplit.slice(-2).join('/')
  }

  return nameWithoutProtocol.replace('.git', '');
}
