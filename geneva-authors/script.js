/* Links

Production: https://www.geneva.edu/alumni/authors/assets/data.json
Testing: ./data.json

*/

$(document).ready(() => {
  $.getJSON("./data.json", (initialData) => {
    // Production
    // fetch("https://www.geneva.edu/alumni/authors/assets/data.json")
    //   .then((res) => res.json())
    //   .then((initialData) => {
    const listWrapper = $("#results");
    const paginationWrapper = $("#pagination");
    var currentPage = 1;
    var rowsPerPage = Number($("#maxRows").val());

    $("#filter-keyword").on("keyup", () => {
      if (
        $("#filter-keyword").val().length == 0 ||
        $("#filter-keyword").val().length >= 3
      ) {
        initialize();
      }
    });
    $("#filter-year").on("change", () => {
      initialize();
    });
    $("#maxRows").on("change", () => {
      rowsPerPage = Number($("#maxRows").val());
      initialize();
    });

    initialize();

    function initialize(newIndex) {
      if (!newIndex) {
        if (Number($(".active")[0]))
          newIndex = Number($(".active")[0].innerHTML);
        else newIndex = 1;
      }
      currentPage = newIndex;

      // $("body").find(".highlight").removeClass("highlight");
      listWrapper.children().remove();
      paginationWrapper.children().remove();

      const resultCount = paginateResults();
      var pageCount = minOne(Math.ceil(resultCount / rowsPerPage));

      let previousButton = document.createElement("button");
      previousButton.innerHTML = `<i class="fa-solid fa-angle-left"></i> Back`;
      let nextButton = document.createElement("button");
      nextButton.innerHTML = `Next <i class="fa-solid fa-angle-right"></i>`;

      previousButton.addEventListener("click", () => {
        initialize(minOne(Number($(".active")[0].innerHTML) - 1));
      });
      nextButton.addEventListener("click", () => {
        initialize(minOne(Number($(".active")[0].innerHTML) + 1));
      });

      paginationWrapper.append(previousButton);

      if (newIndex >= 4) {
        let emptyButton = document.createElement("button");
        emptyButton.innerText = "...";
        emptyButton.disabled = true;

        paginationWrapper.append(emptyButton);
      }

      for (let i = 1; i < pageCount || i == 1; i++) {
        if (i >= minZero(newIndex - 2) && i <= minZero(newIndex + 2)) {
          let pageButton = document.createElement("button");
          pageButton.innerText = i;

          pageButton.addEventListener("click", () => {
            initialize(i);
          });

          if (i == newIndex) pageButton.classList.add("active");
          paginationWrapper.append(pageButton);
        }
      }

      if (newIndex < pageCount - 3) {
        let emptyButton = document.createElement("button");
        emptyButton.innerText = "...";
        emptyButton.disabled = true;

        paginationWrapper.append(emptyButton);
      }

      paginationWrapper.append(nextButton);
    }

    function paginateResults() {
      // listWrapper.children().remove();

      let start = rowsPerPage * currentPage;
      let end = start + rowsPerPage;
      let paginatedItems = initialData.slice(start, end);
      let results = [];

      for (let i = 0; i < initialData.length; i++) {
        let item = initialData[i];
        let keyword = $("#filter-keyword").val().toLowerCase();
        let year = Number($("#filter-year").val());
        let publishDate = Number(String(item["Publish_Date"]).substring(0, 4));

        if (
          (item["Title__1"].toLowerCase().includes(keyword) ||
            item["First_Name"].toLowerCase().includes(keyword) ||
            item["Last_Name"].toLowerCase().includes(keyword) ||
            item["Publisher"].toLowerCase().includes(keyword)) &&
          (year == "" || (publishDate < year + 9 && publishDate > year))
        ) {
          results.push(item);

          if (i < paginatedItems.length) {
            listWrapper.append(`
              <div class="item">
                <p><b>Title:</b> ${item["Title__1"]}</p>
                <p><b>Author:</b> ${item["First_Name"]} ${item["Last_Name"]}</p>
                <p><b>Publisher:</b> ${item["Publisher"]}</p>
                <p><b>Published:</b> ${item["Publish_Date"]}</p>
              </div>
            `);
          }
        }
      }

      if ($("#filter-keyword").val() !== "") {
        $("body").highlight(String($("#filter-keyword").val()));
      }

      return results.length;
    }

    function minZero(num) {
      if (num < 0) num = 0;
      return num;
    }

    function minOne(num) {
      if (num < 1) num = 1;
      return num;
    }

    // The function that parses the URL into the search bar.
    function urlToSearch() {
      /*
        This function is only used inside of the 'urlToSearch' function, and
        flips the provided JSON object's keys and values so that it can be
        used properly.

        If it's needed outside of the 'urlToSearch' function, we can move it.
      */
      function reverseObject(initialObject) {
        // 'reversedObject' will be the reversed JSON object we return at the end of the function.
        var reversedObject = {};

        /*
          Filters through each key, double checks to make sure the JSON object
          has a corresponding value, and puts both the key and value into the
          new object.
        */
        for (var prop in initialObject) {
          if (initialObject.hasOwnProperty(prop)) {
            reversedObject[initialObject[prop]] = prop;
          }
        }

        return reversedObject;
      }

      // This will have a list of each hash in the URL.
      let values = {};

      // This parses out the hashes from the URL so that we can use them.
      let hashes = window.location.href
        .slice(window.location.href.indexOf("?") + 1)
        .split("&");

      // This loops through the hashes we now have and puts them into the 'values' array.
      let hash;
      for (let i = 0; i < hashes.length; i++) {
        hash = hashes[i].split("=");
        values[hash[0]] = hash[1];
      }

      // And last but not least, we apply each hash into the search bar and dropdowns.
      if (values["keyword"])
        $("#filter-keyword").val(decodeURIComponent(values["keyword"]));
      // if (values["program"])
      //   $("#filter-program")
      //     .val(reverseObject(interestLegends)[values["program"]])
      //     .change();
      if (values["year"])
        $("#filter-year").val(interesLegends(values["year"])).change();
    }
  });
});
