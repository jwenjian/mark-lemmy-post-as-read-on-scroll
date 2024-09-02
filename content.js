function isElementOutOfViewportFromTop(el) {
  const rect = el.getBoundingClientRect();
  return rect.bottom < 0;
}

function handleElementOutOfView(element) {
  console.log("Element out of view from top:", element);

  // get post id
  let link_el = element.querySelector("div.post-title>h1>a");
  let post_id = link_el.href.split("/").pop();

  console.log(`about to mark post ${post_id} as read`);

  fetch(`/api/v3/post?id=${post_id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + jwtcookie.value,
    },
  });
  // show as read
  element.style.opacity = 0.3;
}

var elements = [];

async function registerScrollEvent() {
  // add scroll event listener
  window.addEventListener("scroll", () => {
    elements = elements.filter((element) => {
      if (isElementOutOfViewportFromTop(element)) {
        handleElementOutOfView(element);
        return false; // remove element from array to avoid checking it again
      }
      return true; // keep element in array
    });
  });
}

async function doTheJob() {
  console.log("doing the job");
  const selector = "article.post-container";

  elements = Array.from(document.querySelectorAll(selector));

  console.log(`${elements.length} elements found`);

  while (elements.length === 0) {
    // Retry after a delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    elements = Array.from(document.querySelectorAll(selector));
  }

  console.log(`${elements.length} elements found after while loop`);

  await registerScrollEvent();
}

let jwtcookie = null;

async function getCookie() {
  jwtcookie = await cookieStore.get("jwt");
  if (jwtcookie) {
    console.log("cookie got");
    if (document.readyState === "loading") {
      window.addEventListener("DOMContentLoaded", doTheJob);
      console.log("event listener added");
    } else {
      await doTheJob();
      console.log("doTheJob called directly");
    }
  } else {
    console.log("cookie not found");
    console.log("please login to lemmy first to use this extension");
  }
}

getCookie();
