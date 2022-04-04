$(document).ready(() => {
  $.getJSON("./data.json", (initialData) => {
    const listWrapper = $("#results");
    const paginationWrapper = $("#pagination");
    var currentPage = 1;
    var rowsPerPage = Number($("#maxRows").val());

    $("#filter-keyword").on("keyup", () => {
      if (
        $("#filter-keyword").val().length === 0 ||
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
      initialize(1);
    });

    initialize(1);

    function initialize(newIndex) {
      if (!newIndex) newIndex = Number($(".active")[0].innerHTML);
      currentPage = newIndex;

      listWrapper.children().remove();
      paginationWrapper.children().remove();

      paginateResults();

      let page_count = Math.ceil(initialData.length / rowsPerPage);

      let firstButton = document.createElement("button");
      firstButton.innerText = "<<";
      let lastButton = document.createElement("button");
      lastButton.innerText = ">>";
      let previousButton = document.createElement("button");
      previousButton.innerText = "<";
      let nextButton = document.createElement("button");
      nextButton.innerText = ">";

      firstButton.addEventListener("click", () => {
        initialize(1);
      });
      lastButton.addEventListener("click", () => {
        initialize(page_count - 1);
      });
      previousButton.addEventListener("click", () => {
        initialize(minOne(Number($(".active")[0].innerHTML) - 1));
      });
      nextButton.addEventListener("click", () => {
        initialize(minOne(Number($(".active")[0].innerHTML) + 1));
      });

      paginationWrapper.append(firstButton);
      paginationWrapper.append(previousButton);

      for (let i = 1; i < page_count; i++) {
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

      paginationWrapper.append(nextButton);
      paginationWrapper.append(lastButton);
    }

    function paginateResults() {
      listWrapper.children().remove();

      let start = rowsPerPage * currentPage;
      let end = start + rowsPerPage;
      let paginatedItems = initialData.slice(start, end);

      for (let i = 0; i < paginatedItems.length; i++) {
        let item = paginatedItems[i];

        listWrapper.append(`
          <div class="item">
            <p><b>Title:</b> ${item["Title"]}</p>
            <p><b>Author:</b> ${item["First_Name"]} ${item["Last_Name"]}</p>
          </div>
        `);
      }
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
