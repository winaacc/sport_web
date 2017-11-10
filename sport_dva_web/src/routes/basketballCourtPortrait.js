import React from 'react'

var PITCH_LENGTH = 28.0;
var PITCH_WIDTH = 15.0;
var PITCH_HALF_LENGTH = PITCH_LENGTH * 0.5;
var PITCH_HALF_WIDTH = PITCH_WIDTH * 0.5;
var PITCH_MARGIN = 0.0;
var CENTER_CIRCLE_R = 1.8;
var PAINT_ZONE_WIDTH = 4.9;
var PAINT_ZONE_HEIGHT = 5.8;
var RING_R = 0.45/2;
var RING_DISTANCE = 1.575;
var BACKBOARD_WIDTH = 1.8;
var BACKBOARD_DISTANCE = 1.2;
var THREE_DISTANCE = 6.75;
var FREETHROW_R = 1.8;
var RestrictedArea_DISTANCE = 1.25;
var HELI_LINE_LEN = 0.375;

var MIN_FIELD_SCALE = 1.0;

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
    context.strokeStyle = "#fff";
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

function drawHalfCircle(context,x,y,radius,clock) {
    context.beginPath();
    context.arc(x,y,radius,0,Math.PI,clock);
    context.stroke();
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

        //绘制篮球场
        var ctx = canvas.getContext("2d");
        //在给定矩形内清空一个矩形
        ctx.clearRect(0,0,width,actualheight);
        ctx.fillStyle = "#ffcc33"
        ctx.fillRect(0,0,width,actualheight);
        //绘制边线
        drawLine(ctx,left_x,top_y,right_x,top_y);
        drawLine(ctx,right_x,top_y,right_x,bottom_y);
        drawLine(ctx,right_x,bottom_y,left_x,bottom_y);
        drawLine(ctx,left_x,bottom_y,left_x,top_y);

        ctx.fillStyle = "#EC870E"
        var pitch_width = opt.scale(PITCH_WIDTH);
        var pitch_height = opt.scale(PITCH_LENGTH)
        ctx.fillRect(left_x,top_y,pitch_width,pitch_height);


        //绘制中线和中圈
        var center_radius = opt.scale( CENTER_CIRCLE_R );
        drawCircle(ctx,opt.M_field_center.x,opt.M_field_center.y,center_radius);
        drawLine(ctx,left_x,opt.M_field_center.y,right_x,opt.M_field_center.y);

        //绘制油漆区
        var paint_left_x = opt.screenX(-PAINT_ZONE_WIDTH*0.5);
        var paint_zone_width = opt.scale(PAINT_ZONE_WIDTH);
        var paint_zone_height = opt.scale(PAINT_ZONE_HEIGHT);
        ctx.fillStyle="#cc0033";
        ctx.fillRect(paint_left_x,top_y,paint_zone_width,paint_zone_height);
        ctx.fillRect(paint_left_x,bottom_y-paint_zone_height,paint_zone_width,paint_zone_height);

        //绘制篮圈,三分线,合理冲撞区
        var ring_y = opt.screenY(-(PITCH_HALF_LENGTH-RING_DISTANCE));
        var ring_r = opt.scale(RING_R);
        var three_r = opt.scale(THREE_DISTANCE);
        var heli_r = opt.scale(RestrictedArea_DISTANCE);
        drawCircle(ctx,opt.M_field_center.x,ring_y,ring_r);     //绘制篮圈
        drawHalfCircle(ctx,opt.M_field_center.x,ring_y,three_r);//绘制三分线
        drawHalfCircle(ctx,opt.M_field_center.x,ring_y,heli_r); //绘制合理冲撞区
        var three_left_x = opt.screenX(-THREE_DISTANCE);
        var three_right_x = opt.screenX(THREE_DISTANCE);
        var three_y = opt.screenY(-(PITCH_HALF_LENGTH-RING_DISTANCE));
        drawLine(ctx,three_left_x,top_y,three_left_x,three_y);
        drawLine(ctx,three_right_x,top_y,three_right_x,three_y);
        ring_y = opt.screenY((PITCH_HALF_LENGTH-RING_DISTANCE));
        drawCircle(ctx,opt.M_field_center.x,ring_y,ring_r);          //绘制篮圈
        drawHalfCircle(ctx,opt.M_field_center.x,ring_y,three_r,true);//绘制三分线
        drawHalfCircle(ctx,opt.M_field_center.x,ring_y,heli_r,true); //绘制合理冲撞区
        three_y = opt.screenY((PITCH_HALF_LENGTH-RING_DISTANCE));
        drawLine(ctx,three_left_x,bottom_y,three_left_x,three_y);
        drawLine(ctx,three_right_x,bottom_y,three_right_x,three_y);

        //修正合理冲撞区
        var heli_left_x = opt.screenX(-RestrictedArea_DISTANCE);
        var heli_right_x = opt.screenX(RestrictedArea_DISTANCE);
        var heli_top_y = opt.screenY(-(PITCH_HALF_LENGTH-BACKBOARD_DISTANCE-HELI_LINE_LEN));
        var heli_bottom_y = opt.screenY(-(PITCH_HALF_LENGTH-BACKBOARD_DISTANCE))
        drawLine(ctx,heli_left_x,heli_bottom_y,heli_left_x,heli_top_y);
        drawLine(ctx,heli_right_x,heli_bottom_y,heli_right_x,heli_top_y);
        heli_top_y = opt.screenY((PITCH_HALF_LENGTH-BACKBOARD_DISTANCE-HELI_LINE_LEN));
        heli_bottom_y = opt.screenY((PITCH_HALF_LENGTH-BACKBOARD_DISTANCE))
        drawLine(ctx,heli_left_x,heli_bottom_y,heli_left_x,heli_top_y);
        drawLine(ctx,heli_right_x,heli_bottom_y,heli_right_x,heli_top_y);


        //绘制篮板
        var bankboard_left_x = opt.screenX(-BACKBOARD_WIDTH*0.5);
        var bankboard_right_x = opt.screenX(BACKBOARD_WIDTH*0.5);
        var bankboard_y = opt.screenY(-(PITCH_HALF_LENGTH-BACKBOARD_DISTANCE));
        drawLine(ctx,bankboard_left_x,bankboard_y,bankboard_right_x,bankboard_y);
        bankboard_y = opt.screenY((PITCH_HALF_LENGTH-BACKBOARD_DISTANCE));
        drawLine(ctx,bankboard_left_x,bankboard_y,bankboard_right_x,bankboard_y);

        //绘制罚球半圆
        var freethrow_x = opt.M_field_center.x;
        var freethrow_r = opt.scale(FREETHROW_R);
        var freethrow_y = opt.screenY(-(PITCH_HALF_LENGTH-PAINT_ZONE_HEIGHT))
        drawHalfCircle(ctx,freethrow_x,freethrow_y,freethrow_r);
        freethrow_y = opt.screenY((PITCH_HALF_LENGTH-PAINT_ZONE_HEIGHT))
        drawHalfCircle(ctx,freethrow_x,freethrow_y,freethrow_r,true);

        document.documentElement.addEventListener('touchstart',this.touchstart);
        document.documentElement.addEventListener('touchmove',this.touchmove)
        document.documentElement.addEventListener('touchend',this.touchend)
    }

    touchstart = (e)=>{
        e.preventDefault();
    }

    touchmove = (e)=>{
        e.preventDefault();
    }

    touchend = (e)=>{
        e.preventDefault();
    }

    componentWillUnmount(){
        document.documentElement.removeEventListener('touchstart',this.touchstart);
        document.documentElement.removeEventListener('touchmove',this.touchmove);
        document.documentElement.removeEventListener('touchend',this.touchend);
    }
    render(){
        return (
            <canvas id="container"></canvas>
        )
    }
}
