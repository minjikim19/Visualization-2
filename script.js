var width = 1400;
var height = 1000;
var radius = Math.min(width, height) / 2;
var partition, root, arc;
var color = {
    "Action": d3.schemeSet3[0],
    "Adventure": d3.schemeSet3[1],
    "Fighting": d3.schemeSet3[2],
    "Misc": d3.schemeSet3[3],
    "Platform": d3.schemeSet3[4],
    "Puzzle": d3.schemeSet3[5],
    "Racing": d3.schemeSet3[6],
    "Role-Playing": d3.schemeSet3[7],
    "Shooter": d3.schemeSet3[8],
    "Simulation": d3.schemeSet3[9],
    "Sports": d3.schemeSet3[10],
    "Strategy": d3.schemeSet3[11],
    "505 Games": "#6A7B9C",
    "Acclaim Entertainment": "#49556B",
    "Activision": "#95AEDB",
    "Atari": "#9EB8E8",
    "Bethesda Softworks": "#8499C2",
    "Capcom": "#4B709C",
    "Disney Interactive Studios": "#334D6B",
    "Eidos Interactive": "#699EDB",
    "Electronic Arts": "#6FA8E8",
    "Enix Corporation": "#5E8CC2",
    "Fox Interactive": "#35679C",
    "GT Interactive": "#24476B",
    "Hasbro Interactive": "#4B91DB",
    "Konami Digital Entertainment": "#4F99E8",
    "LucasArts": "#4180C2",
    "Microsoft Game Studios": "#24469C",
    "MTV Games": "#19306B",
    "Namco Bandai Games": "#3262DB",
    "Nintendo": "#3568E8",
    "Palcom": "#2D57C2",
    "RedOctane": "#06139C",
    "Sega": "#040D6B",
    "Sony Computer Entertainment": "#091ADB",
    "Sony Computer Entertainment Europe": "#091CE8",
    "Square Enix": "#0716C2",
    "SquareSoft": "#493E9C",
    "Take-Two Interactive": "#322B6B",
    "THQ": "#6758DB",
    "Ubisoft": "#6D5DE8",
    "Universal Interactive": "#5A4DC2",
    "Virgin Interactive": "#463F6B",
    "Vivendi Games": "#655C9C",
    "Warner Bros. Interactive Entertainment": "#7F73C2",
    "DS": "#E8C39E",
    "Wii": "#DBB895",
    "PS": "#C2A383",
    "X360": "#9C836A",
    "2600": "#6B5A49",
    "PC": "#E8AB76",
    "XOne": "#DBA270",
    "GB": "#C28F63",
    "NES": "#9C734F",
    "PSP": "#6B4F37",
    "XB": "#CFA54C",
    "GC": "#C29B47",
    "N64": "#A8873E",
    "GEN": "#826830"
};

var g = d3
    .select("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

d3.csv("data/dataset.csv").then(function(data) {
    console.log(data);
    const hierarchy = buildHierarchy(data);
    partition = d3.partition().size([2 * Math.PI, radius]);
    root = d3.hierarchy(hierarchy).sum(function(d) {
        return d.Global_Sales ? 1 : 0;
    });
    partition(root);
    arc = d3
        .arc()
        .startAngle(function (d) {
            return d.x0;
        })
        .endAngle(function (d) {
            return d.x1;
        })
        .innerRadius(function (d) {
            return d.y0 === 0 ? d.y0 : d.y0 === 100 ? d.y0 - 50 : d.y0 === 200 ? 130 : d.y0 === 300 ? 210 : 290; // 50 130 210 290
        })
        .outerRadius(function (d) {
            return d.y1 === 500 ? d.data.Global_Sales * 5 + 300 : d.y1 === 200 ? d.y1 - 70 : d.y1 === 300 ? 210 : 290; // 80
        });
    d3.selection.prototype.last = function () {
        var last = this.size() - 1;
        return d3.select(this[0][last]);
    };

    // var tooltip = d3.select('.tooltip')
    //     .style('opacity', 0);
    const tooltipHTML = document.getElementById('tooltip');
    g.selectAll("path")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .append("path")
        .attr("display", function (d) {
            return d.depth ? null : "none";
        })
        .attr("d", arc)
        .style("stroke", "#fff")
        .style("fill", function (d) {
                return d.depth === 4 ? color[d.data.Platform] : color[d.data.name];
        })
        .on("mouseover", (d, i) => {
            console.log("here");
            // tooltip.style("opacity", 1);
            // tooltip.style("color", "#000");
            const[x, y] = [d.screenX, d.screenY];
            tooltipHTML.classList.add('show');
            tooltipHTML.style.transform = "translate(" + x + "px," + y + "px)";
            // tooltip.attr('transform', `translate(${x}, ${y})`);
            var nf = new Intl.NumberFormat();
            if(i.depth === 1) {
                tooltipHTML.innerHTML = `
                    <p><strong>Genre - </strong> ${i.data.name}</p>
                `;
            } else if (i.depth === 2) {
                tooltipHTML.innerHTML = `
                    <p><strong>Genre - </strong> ${i.parent.data.name}</p>
                    <p><strong>Publisher - </strong> ${i.data.name}</p>
                `;
            } else if (i.depth === 3) {
                tooltipHTML.innerHTML = `
                    <p><strong>Genre - </strong> ${i.parent.parent.data.name}</p>
                    <p><strong>Publisher - </strong> ${i.parent.data.name}</p>
                    <p><strong>Platform - </strong> ${i.data.name}</p>
                `;
            } else if (i.depth === 4){
                tooltipHTML.innerHTML = `
                    <p><strong>Genre - </strong> ${i.data.Genre}</p>
                    <p><strong>Publisher - </strong> ${i.data.Publisher}</p>
                    <p><strong>Platform - </strong> ${i.data.Platform}</p>
                    <p><strong>Name - </strong> ${i.data.Name}</p>
                    <p><strong>Global_Sales - </strong> $${nf.format(i.data.Global_Sales)}millions</p>
                `;
            }
        })
        .on('mouseleave', () => {
            tooltip.classList.remove('show');
        });

    g.selectAll(".node")
        .append("text")
        .attr("transform", function (d) {
            return (
                "translate(" +
                arc.centroid(d) +
                ")rotate(" +
                computeTextRotation(d) +
                ")"
            );
        })
        .attr("dx", "-20")
        .attr("dy", ".5em")
        .text(function (d) {
            return d.depth == 1 ? d.data.name : null;
        })
        .style("font-size", "10px");
});

function computeTextRotation(d) {
    var angle = ((d.x0 + d.x1) / Math.PI) * 90;
    return angle < 180 ? angle - 90 : angle + 90;
}

function buildHierarchy(csv) {
    var root = { name: "root", children: [], id: "ROOT" };
    var parents = ['Genre', 'Publisher', 'Platform', 'Name'];
    for (var i = 0; i < csv.length; i++) {
        var sequence = csv[i];
        var size = +csv[i].Global_Sales;
        // console.log(sequence);
        // console.log(size);
        if (isNaN(size)) {
            continue;
        }
        var currentNode = root;
        for (var j = 0; j < parents.length; j++) {
            var children = currentNode["children"];
            var nodeName = sequence[parents[j]];
            var childNode;
            if (j + 1 < parents.length) {
                var foundChild = false;
                for (var k = 0; k < children.length; k++) {
                    // console.log(k);
                    if (children[k]["name"] == nodeName) {
                        childNode = children[k];
                        foundChild = true;
                        break;
                    }
                }
                if (!foundChild) {
                    childNode = { name: nodeName, children: [] };
                    children.push(childNode);
                }
                currentNode = childNode;
            } else {
                childNode = { Name: nodeName, NA_Sales: +csv[i].NA_Sales,
                    EU_Sales: +csv[i].EU_Sales, JP_Sales: +csv[i].JP_Sales,
                    Other_Sales: +csv[i].Other_Sales, Global_Sales: size,
                    Platform: csv[i].Platform, Genre: csv[i].Genre, Publisher: csv[i].Publisher };
                children.push(childNode);
            }
        }
    }
    console.log(root);
    return root;
}