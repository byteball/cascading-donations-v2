"use server";

interface packageDependencies {
  repo?: string;
  description?: string;
}

export const getPackageDependencies = async (fullName: string) => {
  const result: packageDependencies[] = [];
  const getters: Promise<void>[] = [];

  try {
    if (fullName) {
      const packageData = await fetch(`https://cdn.jsdelivr.net/gh/${fullName}@latest/package.json`);
      const packageDependencies: packageDependencies = await packageData.json().then((data) => ({ ...(data.dependencies || {}), ...(data.devDependencies || {}) })).catch(() => ({}));

      Object.entries(packageDependencies).slice(0, 50).forEach(([packageName, linkOrVersion]) => {

        if (linkOrVersion.includes("https://github.com") && linkOrVersion.endsWith('.git')) {
          const repoName = transformUrlToRepoFullName(linkOrVersion);
          // direct link to the github repository // EXAMPLE: https://github.com/byteball/ocore
          getters.push(getDescriptionFromGithubByFullName(repoName).then((data) => {
            result.push(({ repo: data.name, description: data.description }))
          }));
        } if (linkOrVersion.includes("github:") || linkOrVersion.includes("github.com:")) {
          getters.push(getDescriptionFromGithubByFullName(linkOrVersion.split(":")[1]).then((data) => {
            result.push(({ repo: data.name, description: data.description }))
          }));
        } if (packageName.startsWith("git@github.com:")) {
          getters.push(getDescriptionFromGithubByFullName(linkOrVersion.split(":")[1]).then((data) => {
            result.push(({ repo: data.name, description: data.description }))
          }));
        } else {
          getters.push(getRepoFullNameByPackageName(packageName).then((data) => {
            if (data && !data.name?.startsWith('packages/')) {
              result.push({ repo: data.name || "", description: data.description });
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

export const getListOfDependentsPackages = async (fullName: string) => {
  const packageData = await fetch(`https://cdn.jsdelivr.net/gh/${fullName}@latest/package.json`);
  const packageName = await packageData.json().then((data) => data.name).catch(() => null);

  if (!packageName) return [];

  const dependentRepositoryData = await fetch(`https://www.npmjs.com/browse/depended/${packageName}`, {
    headers: {
      "X-Spiferack": "1"
    }
  });

  const dependentRepository = await dependentRepositoryData.json().then((data) => data?.packages?.map((data => ({ name: data.name, description: data.description || null })))).catch((e) => { console.error("error: ", e); return []; });

  if (!dependentRepository) return [];

  const getters = dependentRepository.map((data: any) => getRepoFullNameByPackageName(data.name).catch(() => null));

  const res = await Promise.all(getters);

  return res;
}

export const getRepoFullNameByPackageName = async (packageName: string) => {
  try {
    const packageDataResponse = await fetch(`https://cdn.jsdelivr.net/npm/${packageName}/package.json`);
    const packageData = await packageDataResponse.json();

    if (typeof packageData.repository === "string") {
      if (packageData.repository.startsWith("https://github.com/")) {
        return ({ name: transformUrlToRepoFullName(packageData.repository), description: packageData.description })
      } else if (packageData.repository.includes("github")) {
        return ({ name: transformUrlToRepoFullName(packageData.repository), description: packageData.description })
      } else {
        return null;
      }

    } else if (typeof packageData.repository === "object" && packageData.repository.url) {

      if (packageData.repository.url.includes("github")) {
        return ({ name: transformUrlToRepoFullName(packageData.repository.url), description: packageData.description })
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



export const getDescriptionFromGithubByFullName = async (fullName: string) => {

  if (!fullName) return ({
    name: fullName,
    description: ""
  });

  try {
    const packageDataResponse = await fetch(`https://cdn.jsdelivr.net/gh/${fullName}@latest/package.json`);
    const packageData = await packageDataResponse.json();

    return ({
      name: fullName,
      description: packageData.description
    })
  } catch {
    return ({
      name: fullName,
      description: ""
    });
  }
}
