require('dotenv').config();
const Arena = require('are.na');
const apiKey = process.env.API_KEY

let arena = new Arena({ accessToken: apiKey });
async function app() {
    var channelSlug = "diagrams-0qp5l07edtg"
    // var connections = await getConnections(channelSlug);
    var rootChannel = await arena.channel(channelSlug).get();
    console.log(rootChannel);
    var channels = await arena.channel(channelSlug).channels();

    var channelDict = {};

    for (var i = 0; i < channels.length; i++) {
        var c = channels[i];
        const slug = c.channel.slug;
        channelDict[slug] = c.channel;
        channelDict[slug].edges = new Set();
        channelDict[slug].edges.add(rootChannel.slug);

        console.log(i, channels.length, slug);
        var connectedChannels = await arena.channel(slug).channels();

        connectedChannels.forEach((cc) => {
            const ccslug = cc.channel.slug;

            if (ccslug in channelDict) {
                // todo add edge here
                channelDict[ccslug].edges.add(slug);
                return;
            }

            channelDict[ccslug] = cc.channel;
            channelDict[ccslug].edges = new Set();

            channelDict[ccslug].edges.add(slug);
        });
    }

    // console.log(channelDict);

    if (!(rootChannel.slug in channelDict)) {
        rootChannel.edges = new Set();
        channelDict[rootChannel.slug] = rootChannel;

        // rootChannelNode = { id: rootChannel.slug, label: rootChannel.title };
    }


    var nodes = Object.values(channelDict).map(channel => {
        const { id, title, slug, length, status } = channel;
        return { id: slug, label: title }
    });

    var edges = Object.keys(channelDict).map(slug => {
        console.log(slug);
        var e = [...channelDict[slug].edges].map(edge => {
            console.log(edge);
            return { from: slug, to: edge }
        });

        return e.flat();
    }).flat();

    // create a network
    var container = document.getElementById('mynetwork');
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {
        autoResize: true,
        height: '100%',
        width: '100%'
    };

    var network = new vis.Network(container, data, options);
}

document.addEventListener("DOMContentLoaded", function (event) {
    app();
});