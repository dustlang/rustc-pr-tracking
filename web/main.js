/*  Copyright (c) 2018 Pietro Albini <pietro@pietroalbini.org>
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */


function parse_csv(raw) {
    var result = [];

    var lines = raw.split("\n");
    for (var i = 0; i < lines.length; i++) {
        result.push(lines[i].split(","));
    }

    return result;
}


function update_graphs() {
    var graphs = document.querySelectorAll("div.graph");
    for (var i = 0; i < graphs.length; i++) {
        var graph = graphs[i];

        var req = new XMLHttpRequest();
        req.open("GET", graph.getAttribute("data-url"), true);
        req.onreadystatechange = function() {
            if (this.req.readyState == XMLHttpRequest.DONE && this.req.status == 200) {
                process_data(this.req.responseText, this.graph);
            }
        }.bind({req: req, graph, graph});
        req.send();
    }
}


function process_data(data, graph) {
    var csv = parse_csv(data);
    var data = {
        labels: [],
        datasets: [],
    };

    var random_colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6"];
    var max_days = 30;

    // First of all create all the new datasets
    for (var i = 1; i < csv[0].length; i++) {
        data.datasets.push({
            label: csv[0][i],
            data: [],
            backgroundColor: random_colors[i - 1],
        });
    }

    // Then load all the days
    for (var i = Math.min(max_days, csv.length - 1); i >= 1; i--) {
        data.labels.push(csv[i][0]);

        for (var j = 1; j < csv[i].length; j++) {
            data.datasets[j - 1].data.push(csv[i][j]);
        }
    }

    var ctx = graph.getElementsByTagName("canvas")[0].getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    },
                    stacked: true,
                }]
            },
            tooltips: {
                mode: 'index',
                intersect: false,
                multiKeyBackground: 'transparent',

                titleMarginBottom: 8,
                footerMarginTop: 12,
                footerFontStyle: 'normal',

                callbacks: {
                    footer: function(items) {
                        var sum = 0;
                        for (var i = 0; i < items.length; i++) {
                            sum += items[i].yLabel;
                        }

                        return 'Total PRs:  ' + sum;
                    },
                }
            }
        }
    });
}


update_graphs();
