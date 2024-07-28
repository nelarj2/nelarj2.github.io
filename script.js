const years = [2018, 2019, 2020, 2021, 2022];
let currentYearIndex = 0;

const width = 1500;
const height = 500;
const margin = { top: 20, right: 30, bottom: 40, left: 50 };
const tooltip = d3.select("#tooltip");

const svg = d3.select("#visualization")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

function drawBarPlot(year, country = null) {
    // Clear previous visualization
    svg.selectAll("*").remove();

    d3.select("h1").text(`Top 5 Countries With the Highest Mean Temperature Change in year ${year}`);

    // Load data and filter for the top 5 countries with the highest temperature change
    d3.csv("temp_data.csv").then(data => {
        const yearKey = `F${year}`;
        let filteredData;

        if (country) {
            filteredData = data.filter(d => d.Country === country);
        } else {
            const sortedData = data.sort((a, b) => d3.descending(+a[yearKey], +b[yearKey]));
            filteredData = sortedData.slice(0, 5);
        }

        // Check data for debugging
        console.log("Filtered Data:", filteredData);

    // Set up x and y scales
    const x = d3.scaleBand()
        .domain(filteredData.map(d => d.Country))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, 4]) // Fixed domain from 0 to 4
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Create y-axis with specified number of ticks
    const yAxis = d3.axisLeft(y)
        .ticks(4) // Set the maximum number of ticks
        .tickFormat(d3.format(".1f")); // Format ticks to 1 decimal place

    // Draw axes
    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text") // Style x-axis labels
        .style("font-size", "15px") // Set font size for x-axis labels
        .style("font-family", "Arial") // Set font family
        .style("fill", "black"); // Set font color

    // Draw y-axis
    const yAxisGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(yAxis);

    // Style y-axis labels
    yAxisGroup.selectAll("text")
        .style("font-size", "15px") // Set font size for y-axis labels
        .style("font-family", "Arial") // Set font family
        .style("fill", "black")
        .attr("transform", "translate(5, 0)"); // Move labels 5 pixels to the right

        // Draw horizontal gridlines
        svg.append("g")
            .attr("class", "grid")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(y)
           .ticks(10)
            .tickSize(-width + margin.right + margin.left)
            .tickFormat("")
        );

        // Draw vertical gridlines
        svg.append("g")
            .attr("class", "grid")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(x)
            .ticks(10)
            .tickSize(-height + margin.top + margin.bottom)
            .tickFormat("")
        );

        // Draw bars
        svg.selectAll(".bar")
        .data(filteredData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.Country))
        .attr("y", d => {
            return  y(Math.max(0, + d[yearKey]))
        })
        .attr("width", x.bandwidth())
        .attr("height", d => {
            const heightValue = Math.abs(y(0) - y(+d[yearKey]));
            if (isNaN(heightValue)) {
                console.error("Invalid height value:", heightValue);
            }
            return heightValue;
        })
        .attr("fill", d => d[yearKey] >= 0 ? "rgb(0, 197, 255)" : "red")

        svg.selectAll(".label")
        .data(filteredData)
        .enter().append("text")
        .attr("class", "label")
        .attr("x", d => x(d.Country) + x.bandwidth() / 2) // Center the text above the bar
        .attr("y", d => y(+d[yearKey]) - 5) // Position the text slightly above the top of the bar
        .attr("text-anchor", "middle") // Center the text horizontally
        .style("font-size", "15px") // Set the font size for the labels
        .style("fill", "black") // Set the color of the text
        .text(d => d[yearKey]); // Display the value

  // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)") // Rotate the text to be vertical
        .attr("x", -margin.top - (height / 2)) // Adjust positioning from the left edge
        .attr("y", margin.left / 2 - (margin.top / 2)) // Position the text properly from the top edge
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-family", "Arial")
        .style("fill", "black")
        .text("Change °C from 1951-1980 baseline");
    });
}

// Define the years array to include all years from 1961 to 2022
const years_2 = d3.range(1961, 2023); // Generates an array from 1961 to 2022
function drawInteractivePlot() {
    // Clear previous visualization
    svg.selectAll("*").remove();

    d3.select("h1").text("Mean Temperature Change of Meteorological year by Country");

    d3.select(".filter-container").style("display", "block");

    // Load data for all years
    d3.csv("temp_data.csv").then(data => {
        // Set up scales
        const x = d3.scaleBand()
            .domain(years_2.map(year => `F${year}`))
                .range([margin.left, width - margin.right])
                .padding(0.1);

        const y = d3.scaleLinear()
            .range([height - margin.bottom, margin.top]);

        // Draw horizontal gridlines
        svg.append("g")
            .attr("class", "grid")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickSize(-width + margin.right + margin.left)
                .tickFormat("")
            );

        // Draw vertical gridlines
        svg.append("g")
            .attr("class", "grid")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(x)
                .tickSize(-height + margin.top + margin.bottom)
                .tickFormat("")
            );

svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x)
        .tickValues(years_2.filter(year => (year - 1961) % 3 === 0).map(year => `F${year}`)) // Display ticks every 3 years starting from 1961
        .tickFormat(d => d.slice(1))) // Remove "F" from tick labels
    .style("font-size", "15px"); // Set the font size for the label

        // Add filtering interaction
        const countries = ["World", ...new Set(data.map(d => d.Country))];
        const select = d3.select("#countryFilter")
            .selectAll("option")
            .data(countries)
            .enter().append("option")
            .text(d => d);

        d3.select("#countryFilter").on("change", function () {
            const selectedCountry = this.value;
            updateBarsForCountry(data, selectedCountry, x, y);
        });

        // Set default selection to World
        d3.select("#countryFilter").property("value", "World").dispatch("change");
    });
}

function updateBarsForCountry(data, selectedCountry, x, y) {
    // Filter data for the selected country or the world
    const filteredData = selectedCountry === "World" ? data.filter(d => d.Country === "World") : data.filter(d => d.Country === selectedCountry);

    // Compute the range for the y-axis based on filtered data
    const values = years_2.map(year => +filteredData[0][`F${year}`]);
    const minValue = d3.min(values);
    const maxValue = d3.max(values);

    // Set up y-axis scale with dynamic domain
    y.domain([Math.min(0, minValue), maxValue]);

    // Create y-axis with specified number of ticks
    const yAxis = d3.axisLeft(y)
        .ticks(4) // Set the maximum number of ticks
        .tickFormat(d3.format(".1f")); // Format ticks to 1 decimal place

    // Update y-axis
    svg.selectAll(".y-axis").remove(); // Remove old y-axis if it exists
    const yAxisGroup = svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(yAxis);

    // Style y-axis labels
    yAxisGroup.selectAll("text")
        .style("font-size", "16px") // Set font size for y-axis labels
        .style("font-family", "Arial") // Set font family
        .style("fill", "black"); // Set font color

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)") // Rotate the text to be vertical
        .attr("x", -height / 2) // Position the text in the middle of the chart
        .attr("y", margin.left / 1.5 - margin.top) // Adjust positioning from the left edge
        .attr("text-anchor", "middle") // Center the text horizontally
        .style("font-size", "16px") // Set font size for y-axis label
        .style("font-family", "Arial") // Set font family
        .style("fill", "black") // Set font color
        .text("Change °C from 1951-1980 baseline"); // Text for the y-axis label

    // Update bars
    const bars = svg.selectAll(".bar")
        .data(years_2.map(year => ({
            year,
            value: +filteredData[0][`F${year}`]
        })));

    bars.enter().append("rect")
        .attr("class", "bar")
        .merge(bars)
        .attr("x", d => x(`F${d.year}`))
        .attr("y", d => y(Math.max(0, d.value)))
        .attr("width", x.bandwidth())
        .attr("height", d => {
            const heightValue = Math.abs(y(0) - y(d.value));
            if (isNaN(heightValue)) {
                console.error("Invalid height value:", heightValue);
            }
            return heightValue;
        })
        .attr("fill", d => d.value >= 0 ? "rgb(0, 197, 255)" : "rgb(0, 197, 255)")
        .on("mouseover", function (event, d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`${d.year}: ${d.value}`)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
        .on("mouseout", function () {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    bars.exit().remove();
}


// function drawInteractivePlot() {
//     // Clear previous visualization
//     svg.selectAll("*").remove();

//     d3.select("h1").text("Mean Temperature Change of Meteorological year by Country");

//     d3.select(".filter-container").style("display", "block");

//     // Load data for all years
//     d3.csv("temp_data.csv").then(data => {
//         // Set up scales
//         const x = d3.scaleBand()
//             .domain(years.map(year => `F${year}`))
//             .range([margin.left, width - margin.right])
//             .padding(0.1);

//         const y = d3.scaleLinear()
//             .domain([0, 4])
//             .nice()
//             .range([height - margin.bottom, margin.top]);

//       // Draw horizontal gridlines
//         svg.append("g")
//             .attr("class", "grid")
//             .attr("transform", `translate(${margin.left}, 0)`)
//             .call(d3.axisLeft(y)
//             .ticks(5)
//             .tickSize(-width + margin.right + margin.left)
//             .tickFormat("")
//         );

//         // Draw vertical gridlines
//         svg.append("g")
//             .attr("class", "grid")
//             .attr("transform", `translate(0, ${height - margin.bottom})`)
//             .call(d3.axisBottom(x)
//             .tickSize(-height + margin.top + margin.bottom)
//             .tickFormat("")
//         );

//         // Draw axes
//         svg.append("g")
//             .attr("transform", `translate(0, ${height - margin.bottom})`)
//             .call(d3.axisBottom(x).tickFormat(d => d.slice(1))) // Remove "F" from tick labels
//             .style("font-size", "15px") // Set the font size for the labels

//         // Add filtering interaction
//         const countries = ["United States", ...new Set(data.map(d => d.Country))];
//         const select = d3.select("#countryFilter")
//             .selectAll("option")
//             .data(countries)
//             .enter().append("option")
//             .text(d => d);

//         d3.select("#countryFilter").on("change", function () {
//             const selectedCountry = this.value;
//             updateBarsForCountry(data, selectedCountry,x,y);
//         });

//         // Set default selection to United States
//         d3.select("#countryFilter").property("value", "United States").dispatch("change");
//     });
// }

// function updateBarsForCountry(data, selectedCountry,x,y) {
//     // Filter data for the selected country
//     const filteredData = data.filter(d => d.Country === selectedCountry);

//  // Compute the range for the y-axis based on filtered data
//     const values = years.map(year => +filteredData[0][`F${year}`]);
//     const minValue = d3.min(values);
//     const maxValue = d3.max(values);

//     // Set domain with a buffer to improve visualization
//     const buffer = 0.1; // Adjust the buffer as needed
//     const yAxisDomain = [Math.min(0, minValue - buffer), maxValue + buffer];

//     // Set up y-axis scale with dynamic domain
//     y.domain([0, 4])

//     // Create y-axis with specified number of ticks
//     const yAxis = d3.axisLeft(y)
//         .ticks(4) // Set the maximum number of ticks
//         .tickFormat(d3.format(".1f")); // Format ticks to 1 decimal place

//     // Update y-axis
//     svg.selectAll(".y-axis").remove(); // Remove old y-axis if it exists
//     const yAxisGroup = svg.append("g")
//         .attr("class", "y-axis")
//         .attr("transform", `translate(${margin.left}, 0)`)
//         .call(yAxis);

//     // Style y-axis labels
//     yAxisGroup.selectAll("text")
//         .style("font-size", "16px") // Set font size for y-axis labels
//         .style("font-family", "Arial") // Set font family
//         .style("fill", "black"); // Set font color

//     // Add y-axis label
//     svg.append("text")
//     .attr("transform", "rotate(-90)") // Rotate the text to be vertical
//     .attr("x", -height / 2) // Position the text in the middle of the chart
//     .attr("y", margin.left / 1.5 - margin.top) // Adjust positioning from the left edge
//     .attr("text-anchor", "middle") // Center the text horizontally
//     .style("font-size", "16px") // Set font size for y-axis label
//     .style("font-family", "Arial") // Set font family
//     .style("fill", "black") // Set font color
//     .text("Change °C from 1951-1980 baseline"); // Text for the y-axis label

//     // Update bars
//     const bars = svg.selectAll(".bar")
//     .data(years.map(year => ({
//         year,
//         value: +filteredData[0][`F${year}`]
//     })));

//     bars.enter().append("rect")
//     .attr("class", "bar")
//     .merge(bars)
//     .attr("x", d => x(`F${d.year}`))
//     .attr("y", d => y(Math.max(0, d.value)))
//     .attr("width", x.bandwidth())
//     .attr("height", d => {
//         const heightValue = Math.abs(y(0) - y(d.value));
//         if (isNaN(heightValue)) {
//             console.error("Invalid height value:", heightValue);
//         }
//         return heightValue;
//     })
//     .attr("fill", d => d.value >= 0 ? "rgb(0, 197, 255)" : "red")

//     // Update labels
//     const labels = svg.selectAll(".label")
//         .data(years.map(year => ({
//             year,
//             value: +filteredData[0][`F${year}`]
//         })));

//     labels.enter().append("text")
//     .attr("class", "label")
//     .merge(labels)
//     .attr("x", d => x(`F${d.year}`) + x.bandwidth() / 2) // Center the text horizontally above the bar
//     .attr("y", d => y(d.value) - 5) // Position the text slightly above the top of the bar
//     .attr("text-anchor", "middle") // Center the text horizontally
//     .style("font-size", "16px") // Set the font size for the labels
//     .style("fill", "black") // Set the color of the text
//     .text(d => d.value); // Display the value

//     labels.exit().remove(); // Remove old labels
//     bars.exit().remove();
// }

function updateVisualization() {
    if (currentYearIndex < years.length) {
        drawBarPlot(years[currentYearIndex]);
        d3.select(".filter-container").style("display", "none");
    } else {
        drawInteractivePlot();
    }
}

// Initial render
updateVisualization();

// Navigation buttons
d3.select("#prev").on("click", () => {
    if (currentYearIndex > 0) {
        currentYearIndex--;
        updateVisualization();
    }
});

d3.select("#next").on("click", () => {
    if (currentYearIndex <= years.length) {
        currentYearIndex++;
        updateVisualization();
    }
});
