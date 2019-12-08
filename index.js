// https://nodejs.org/es/docs/guides/backpressuring-in-streams/
// https://medium.com/better-programming/video-stream-with-node-js-and-html5-320b3191a6b6
// https://www.google.com/search?rlz=1C5CHFA_enUS818US818&sxsrf=ACYBGNQJTZO7Kh8-ACfyMlyBKUIU0Ah7aw%3A1575843519237&ei=v3btXc2JDonAsAWNo4RA&q=Split+video+with+nodejs+fs&oq=Split+video+with+nodejs+fs&gs_l=psy-ab.3..33i22i29i30l9.15693.20832..20998...4.0..0.186.4133.1j29......0....1..gws-wiz.....10..35i362i39j35i39j0i67j0j0i203j0i22i30j0i19j0i13i30i19j0i8i13i30i19.gGIZ4AcBlcY&ved=0ahUKEwiN5b3JiqfmAhUJIKwKHY0RAQgQ4dUDCAs&uact=5
// https://stackoverflow.com/questions/36983918/how-to-split-a-file-to-several-parts-write-those-parts-to-disk-and-join-them-ba
// https://stackoverflow.com/questions/31046930/how-to-cut-a-video-in-specific-start-end-time-in-ffmpeg-by-node-js

const cluster = require('cluster');
const fs = require('fs');

const file = './dexter_intro.mp4';
const videoContent = fs.readFileSync('./dexter_intro.mp4');

if (cluster.isMaster) {

    
    const fileSize = fs.lstatSync(file).size;
    const fileDivisions = Math.round(fileSize / 1000000);
    const amount_of_partitions_in_size = fileSize / fileDivisions; 


    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < fileDivisions; i++) {
        cluster.fork(
            {
                "fork_id": i,
                "file_size": fileSize,
                "amount_of_partitions": fileDivisions,
                "amount_of_partitions_in_size": amount_of_partitions_in_size,
            });
    }

} else {

    const fork_id = parseInt(process.env.fork_id); 
    const start = process.env.amount_of_partitions_in_size * fork_id;
    const end = process.env.amount_of_partitions_in_size * (fork_id + 1); 


    console.log({
        fork_id: process.env.fork_id,
        start: start,
        end: end,
    });
    console.log(videoContent);
    console.log(videoContent.data);
    process.exit(0)

    const file = fs.createWriteStream(`./write_here/part_${process.env.fork_id}.mp4`, 
        {
            start : start,
            end : end
        }
    )


    file.write(videoContent.data);
}




// fs.createReadStream(path.join(__dirname ,input),
//     {
//         start : 0,
//         end : half,
//         autoClose: true
//     }
// );