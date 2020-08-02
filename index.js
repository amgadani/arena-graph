const Arena = require('are.na');
require('dotenv').config();

const apiKey = process.env.API_KEY

// Connections seems to be incoming (the channel exists in the other channels)
let arena = new Arena({ accessToken: apiKey });
// const getConnections = async function (channelSlug) {
//     var connections = await arena
//         .channel(channelSlug)
//         .connections();
//     printConnectionsInfo(connections);
// }

// function printConnectionsInfo(connections) {
//     connections.forEach(connection => {
//         const { title, slug, length, status } = connection;
//         console.log(title, length);
//     });
// }

// function printChannelsInfo(channels) {
//     console.log("Channels: ");
//     channels.forEach(channel => {

//         const { id, title, slug, length, status } = channel.channel;
//         console.log(title, length, channel.count);
//         // const { title, slug, length, status } = connection;
//         // console.log(title, length);
//     });
// }


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

        connectedChannels.slice(0, 2).forEach((cc) => {
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


    console.log(channelDict);
    // printChannelsInfo(channels);



    if (!(rootChannel.slug in channelDict)) {
        rootChannel.edges = new Set();
        channelDict[rootChannel.slug] = rootChannel;

        // rootChannelNode = { id: rootChannel.slug, label: rootChannel.title };
    }


    var nodes = Object.values(channelDict).map(channel => {
        const { id, title, slug, length, status } = channel;
        return { id: slug, label: title }
    });
    // var edges = nodes.map(cn => {
    //     return { from: rootChannel.slug, to: cn.id };
    // })

    var edges = Object.keys(channelDict).map(slug => {
        console.log(slug);
        var e = [...channelDict[slug].edges].map(edge => {
            console.log(edge);
            return { from: slug, to: edge }
        });

        return e.flat();
    }).flat();


    console.log(nodes, edges);
    // nodes.push(rootChannelNode);


    // for
    // const vis = require('vis-network');
    // console.log(vis);
    // create an array with nodes
    // var nodes = new vis.DataSet([
    //     { id: 1, label: 'Node 1' },
    //     { id: 2, label: 'Node 2' },
    //     { id: 3, label: 'Node 3' },
    //     { id: 4, label: 'Node 4' },
    //     { id: 5, label: 'Node 5' }
    // ]);

    // // create an array with edges
    // var edges = new vis.DataSet([
    //     { from: 1, to: 3 },
    //     { from: 1, to: 2 },
    //     { from: 2, to: 4 },
    //     { from: 2, to: 5 },
    //     { from: 3, to: 3 }
    // ]);

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