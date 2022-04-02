$(document).ready(function () {
  fetch('https://www.geneva.edu/academics/programs/json/programs.json')
    .then((res) => res.json())
    .then((data) => {
      const interestLegends = {
        'Arts, Design & Communication': 'arts',
        'Biblical Studies, Philosophy & Ministry': 'ministry',
        'Business & Sport Management': 'business',
        'Computer Science & Technology': 'compsci',
        'Education & Teaching': 'education',
        'Nursing, Healthcare & Life Sciences': 'health',
        'Political Science, History & Languages': 'polisci',
        'Psychology & Social Services': 'psych',
        'Science, Engineering & Mathematics': 'stem',
      }

      $('.wide-container').append(`
        <button onclick="copyURI()">Copy URL</button>
      `)

      urlToSearch()
      search()

      $('#filter-keyword').on('keyup', function () {
        search()
      })

      $('#filter-interest').change(function () {
        search()
      })

      $('#filter-degree').change(function () {
        search()
      })

      function search() {
        var values = [],
          results = []

        values.push($('#filter-keyword').val().toLowerCase())
        values.push($('#filter-interest option:selected').val())
        values.push($('#filter-degree option:selected').val())

        for (let i = 0; i < data.length; i++) {
          var keywordIncluded = false
          for (let j = 0; j < data[i].keywords.length; j++) {
            if (data[i].keywords[j].includes(values[0])) keywordIncluded = true
          }

          var title = data[i].title.toLowerCase()
          if (
            (title.includes(values[0]) || keywordIncluded) &&
            (data[i].interest_types.includes(values[1]) || values[1] == '') &&
            (data[i].degree_type.includes(values[2]) || values[2] == '')
          ) {
            results.push(data[i])
          } else {
            clearResults()
            nothingFound()
          }

          clearResults()
          for (let i = 0; i < results.length; i++) {
            let j = results[i]

            $('#results').append(
              `
                <div class="card flex-item">
                  <div class="card-info">
                    <a href="${j.link}">
                      <img
                        alt="${j.title}"
                        class="u-full-width"
                        src="${j.image}"
                      />
                    </a>
                    <h2>${j.title}</h2>
                    <p><span class="ico-circ">${j.degree_code[0].toUpperCase()}</span> ${
                j.degree_code[0] === 'co' ? 'Concentration' : ''
              }${
                j.degree_code[0] === 'bs' || j.degree_code[0] === 'ba'
                  ? "Bachelor's"
                  : ''
              }</p>
                  </div>
                </div>
              `
            )
          }

          if (results.length % 4 !== 0) {
            let blanks = 4 - Math.floor(results.length / 4)

            for (let k = 0; k < blanks; k++) {
              $('#results').append(`<div class="card-blank flex-item"></div>`)
            }
          }
        }

        function clearResults() {
          $('#results .card').remove()
          $('#results .card-blank').remove()
          $('#results .nothing-found').remove()

          if (results.length == 0) {
            nothingFound()
          }
        }

        function nothingFound() {
          $('#results').append(`
            <div class="nothing-found">
              <h1>No Results Found</h1>
            </div>
          `)
        }
      }

      function urlToSearch() {
        function reverseObject(data) {
          var new_obj = {}

          for (var prop in data) {
            if (data.hasOwnProperty(prop)) {
              new_obj[data[prop]] = prop
            }
          }

          return new_obj
        }

        let vars = []

        let hashes = window.location.href
          .slice(window.location.href.indexOf('?') + 1)
          .split('&')

        let hash
        for (let i = 0; i < hashes.length; i++) {
          hash = hashes[i].split('=')
          vars.push(hash[0])
          vars[hash[0]] = hash[1]
        }

        if (vars['keyword'])
          $('#filter-keyword').val(decodeURIComponent(vars['keyword']))
        if (vars['interest'])
          $('#filter-interest')
            .val(reverseObject(interestLegends)[vars['interest']])
            .change()

        if (vars['degree']) $('#filter-degree').val(vars['degree']).change()
      }
    })
})
