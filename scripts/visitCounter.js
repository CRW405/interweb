const url = "https://api.counterapi.dev/v1/crw405s-team-2424/katzmo/hit";

fetch(input)
  .then((res) => res.json())
  .then((data) => {
    document.getElementById("visit-count").innerText = data.value;
  });
