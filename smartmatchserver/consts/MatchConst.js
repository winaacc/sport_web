
module.exports = {
    matchstate:{
        init:1,      //比赛创建完毕
        invited:2,   //球员邀请完成
        teamscreated:3, //临时球队创建完毕
        formatconfirmed:4, //赛制确认完毕
        start:5,           //比赛开始
        end:6              //比赛结束
    },
    matchtype:{
        streetmatch:1,
        friendsmatch:2,
        leaguematch:3,
        cupmatch:4,
        officialmatch:5
    },
    sport_type:{
        basketball:1,
        football:2,
        Badminton:3
    },
    league_type:{
        win_on_court:1,
        cup:2,
        loop:3,
        nba:4,
        world_cup:5,
        custom:6
    }
}