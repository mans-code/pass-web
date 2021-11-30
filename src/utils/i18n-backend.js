import { fetchAPI } from "./api";

class Backend {
  read(lng, ns, cb) {
    // Validate backendOptions

    getLocales(lng, ns)
      .then((data) => {
        cb(null, data);
      })
      .catch((e) => {
        cb(`Failed to load locales: ${e.message}`, false);
      });
  }
}

const buildApiUrl = (lng, ns) =>
  `/pass/api/lookups/translations/v1?group=server.${ns}&language=${lng}`;

const getLocales = async (lng, ns) => {
  try {
    if (ns === "errors" || ns === "policies" || ns === "enums") {
      let result = await fetchAPI(buildApiUrl(lng, ns));

      return result.data;
    } else {
      let result = await fetchAPI(`/pass/web/locales/${lng}/${ns}.json`, {
        host: "",
      });

      return result.data;
    }
  } catch (e) {
    throw new Error(e.message);
  }
};

Backend.type = "backend";

export default Backend;
