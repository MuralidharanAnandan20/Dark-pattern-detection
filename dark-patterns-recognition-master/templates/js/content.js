const endpoint = "http://127.0.0.1:5000/";
const descriptions = {
  "Sneaking": "Coerces users to act in ways that they would not normally act by obscuring information.",
  "Urgency": "Places deadlines on things to make them appear more desirable",
  "Misdirection": "Aims to deceptively incline a user towards one choice over the other.",
  "Social Proof": "Gives the perception that a given action or product has been approved by other people.",
  "Scarcity": "Tries to increase the value of something by making it appear to be limited in availability.",
  "Obstruction": "Tries to make an action more difficult so that a user is less likely to do that action.",
  "Forced Action": "Forces a user to complete extra, unrelated tasks to do something that should be simple.",
};

function scrape() {
  let elements = segments(document.body);
  if (elements.length === 0) return;

  let filtered_elements = elements.map(element => element.innerText.trim().replace(/\t/g, " ")).filter(text => text.length > 0);

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tokens: filtered_elements }),
  })
    .then((resp) => resp.json())
    .then((data) => {
      data = data.replace(/'/g, '"');
      let json = JSON.parse(data);
      let dp_count = 0;
      let element_index = 0;
      let categoryCounts = {};

      elements.forEach((element, i) => {
        let text = element.innerText.trim().replace(/\t/g, " ");
        if (text.length > 0 && json.result[i] !== "Not Dark") {
          let category = json.result[i];
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          highlight(element, category);
          dp_count++;
        }
      });

      let g = document.createElement("div");
      g.id = "insite_count";
      g.value = dp_count;
      g.style.opacity = 0;
      g.style.position = "fixed";
      document.body.appendChild(g);
      sendDarkPatterns(g.value);
      sendCategoryCounts(categoryCounts);
    })
    .catch((error) => {
      console.error(error);
    });
}

function highlight(element, type) {
  element.classList.add("insite-highlight");

  let body = document.createElement("span");
  body.classList.add("insite-highlight-body");

  let header = document.createElement("div");
  header.classList.add("modal-header");
  let headerText = document.createElement("h1");
  headerText.innerHTML = type + " Pattern";
  header.appendChild(headerText);
  body.appendChild(header);

  let content = document.createElement("div");
  content.classList.add("modal-content");
  content.innerHTML = descriptions[type];
  body.appendChild(content);

  element.appendChild(body);
}

function sendCategoryCounts(counts) {
  chrome.runtime.sendMessage({
    message: "update_current_counts",
    counts: counts,
  });
}

function sendDarkPatterns(count) {
  chrome.runtime.sendMessage({
    message: "update_current_count",
    count: count,
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "analyze_site") {
    scrape();
  } else if (request.message === "popup_open") {
    let element = document.getElementById("insite_count");
    if (element) {
      sendDarkPatterns(element.value);
    }
  }
});
