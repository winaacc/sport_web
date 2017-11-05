import React from 'react'

var PITCH_LENGTH = 105.0;
var PITCH_WIDTH = 68.0;
var PITCH_HALF_LENGTH = PITCH_LENGTH * 0.5;
var PITCH_HALF_WIDTH = PITCH_WIDTH * 0.5;
var PITCH_MARGIN = 5.0;
var CENTER_CIRCLE_R = 9.15;
var PENALTY_AREA_LENGTH = 16.5;
var PENALTY_AREA_WIDTH = 40.32;
var PENALTY_CIRCLE_R = 9.15;
var PENALTY_SPOT_DIST = 11.0;
var GOAL_WIDTH = 14.02;
var GOAL_HALF_WIDTH = GOAL_WIDTH * 0.5;
var GOAL_AREA_LENGTH = 5.5;
var GOAL_AREA_WIDTH = 18.32;
var GOAL_DEPTH = 2.44;
var CORNER_ARC_R = 1.0;
var GOAL_POST_RADIUS = 0.06;

var MIN_FIELD_SCALE = 1.0;
var MAX_FIELD_SCALE = 400.0;

function Options(){
    this.M_canvas_width = -1;
    this.M_canvas_height = -1;
    this.M_zoomed = false;
    this.M_field_scale = 1;
    this.M_field_center = {x:0,y:0};

}
Options.prototype.updateFieldSize = function(canvas_width,canvas_height){
    this.M_canvas_width = canvas_width;
    this.M_canvas_height = canvas_height;

    var total_pitch_l = PITCH_LENGTH+PITCH_MARGIN * 2.0+1;
    var total_pitch_w = PITCH_WIDTH+PITCH_MARGIN*2.0;

    this.M_field_scale = canvas_height/total_pitch_l;

    var field_width = canvas_width;

    if(total_pitch_w*this.M_field_scale > field_width){
        this.M_field_scale = field_width/total_pitch_w;
    }

    if(this.M_field_scale < MIN_FIELD_SCALE){
        this.M_field_scale = MIN_FIELD_SCALE;
    }

    this.M_field_center.x = field_width/2;
    this.M_field_center.y = canvas_height/2;

}
Options.prototype.scale = function(len){
    return len*this.M_field_scale;
}

Options.prototype.screenX = function(x){
    return this.M_field_center.x + this.scale(x);
}
Options.prototype.screenY = function(y){
    return this.M_field_center.y + this.scale(y);
}
Options.prototype.fieldX = function(x){
    return (x-this.M_field_center.x)/this.M_field_scale;
}
Options.prototype.fieldY = function(y){
    return (y - this.M_field_center.y)/this.M_field_scale;
}

function drawLine(context,left,top,right,bottom){
    context.strokeStyle = "red";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(left,top);
    context.lineTo(right,bottom);
    context.stroke();
}

function drawCircle(context,x,y,radius) {
    context.fillStyle = "#ccc"
    context.beginPath();
    context.arc(x,y,radius,0,2*Math.PI);
    context.stroke();
    context.fill();
}

export default class App extends React.Component{
    componentDidMount(){
        var canvas = document.getElementById("container");
        var height = document.documentElement.clientHeight;
        var width = document.documentElement.clientWidth;
        var actualheight = height - canvas.offsetTop;
        canvas.setAttribute("width",width);
        canvas.setAttribute("height",actualheight);
        console.log("width:"+width);
        console.log("actualheight:"+actualheight);

        var opt = new Options();
        opt.updateFieldSize(width,actualheight);
        var top_y   = opt.screenY( - PITCH_HALF_LENGTH );
        var bottom_y  = opt.screenY( + PITCH_HALF_LENGTH );
        var left_x    = opt.screenX( - PITCH_HALF_WIDTH );
        var right_x = opt.screenX( + PITCH_HALF_WIDTH );

        //绘制足球场
        var ctx = canvas.getContext("2d");
        //在给定矩形内清空一个矩形
        ctx.clearRect(0,0,width,actualheight);
        ctx.fillStyle = "green"
        ctx.fillRect(0,0,width,actualheight);
        //绘制边线
        drawLine(ctx,left_x,top_y,right_x,top_y);
        drawLine(ctx,right_x,top_y,right_x,bottom_y);
        drawLine(ctx,right_x,bottom_y,left_x,bottom_y);
        drawLine(ctx,left_x,bottom_y,left_x,top_y);

        //绘制中线和中圈
        var center_radius = opt.scale( CENTER_CIRCLE_R );
        drawCircle(ctx,opt.M_field_center.x,opt.M_field_center.y,center_radius);
        drawLine(ctx,left_x,opt.M_field_center.y,right_x,opt.M_field_center.y);

        //绘制左边的禁区
        var pen_left_x = opt.screenX(-PENALTY_AREA_WIDTH*0.5);
        var pen_right_x = opt.screenX(PENALTY_AREA_WIDTH*0.5);
        var pen_y = opt.screenY(-( PITCH_HALF_LENGTH - PENALTY_AREA_LENGTH ))
        var pen_spot_y = opt.screenY( -( PITCH_HALF_LENGTH - PENALTY_SPOT_DIST ) );
        drawLine(ctx,pen_left_x,top_y,pen_left_x,pen_y);
        drawLine(ctx,pen_left_x,pen_y,pen_right_x,pen_y);
        drawLine(ctx,pen_right_x,pen_y,pen_right_x,top_y);
        //绘制点球点
        drawCircle(ctx,opt.M_field_center.x,pen_spot_y,3);

        //绘制右边的禁区
        var pen_y = opt.screenY(( PITCH_HALF_LENGTH - PENALTY_AREA_LENGTH ))
        var pen_spot_y = opt.screenY( ( PITCH_HALF_LENGTH - PENALTY_SPOT_DIST ) );
        drawLine(ctx,pen_left_x,bottom_y,pen_left_x,pen_y);
        drawLine(ctx,pen_left_x,pen_y,pen_right_x,pen_y);
        drawLine(ctx,pen_right_x,pen_y,pen_right_x,bottom_y);
        //绘制点球点
        drawCircle(ctx,opt.M_field_center.x,pen_spot_y,3);

        //绘制小禁区
        var goal_area_left_x =opt.screenX(-GOAL_AREA_WIDTH*0.5);
        var goal_area_right_x = opt.screenX(GOAL_AREA_WIDTH*0.5);
        var goal_area_y = opt.screenY(- (PITCH_HALF_LENGTH - GOAL_AREA_LENGTH));
        drawLine(ctx,goal_area_left_x,top_y,goal_area_left_x,goal_area_y);
        drawLine(ctx,goal_area_left_x,goal_area_y,goal_area_right_x,goal_area_y);
        drawLine(ctx,goal_area_right_x,goal_area_y,goal_area_right_x,top_y);
        goal_area_y = opt.screenY((PITCH_HALF_LENGTH - GOAL_AREA_LENGTH));
        drawLine(ctx,goal_area_left_x,bottom_y,goal_area_left_x,goal_area_y);
        drawLine(ctx,goal_area_left_x,goal_area_y,goal_area_right_x,goal_area_y);
        drawLine(ctx,goal_area_right_x,goal_area_y,goal_area_right_x,bottom_y);

        //绘制球门
        var goal_x = opt.screenX(-GOAL_WIDTH*0.5);
        var goal_size_y = opt.scale( GOAL_DEPTH );
        var goal_size_x = opt.scale( GOAL_WIDTH );
        var left = opt.screenY(-PITCH_HALF_LENGTH - GOAL_DEPTH) -1;
        var right = opt.screenY(PITCH_HALF_LENGTH) -1;
        ctx.fillRect(goal_x,left,goal_size_x,goal_size_y);
        ctx.fillRect(goal_x,right,goal_size_x,goal_size_y);

    }
    render(){
        return (
            <canvas id="container"></canvas>
        )
    }
}
