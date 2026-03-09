package edu.eci.arsw.canvas.models;

public class DrawEvent {

    private String type;
    private double x1;
    private double y1;
    private double x2;
    private double y2;
    private String color;

    public String getType() {
        return type;
    }

    public double getX1() {
        return x1;
    }

    public double getX2() {
        return x2;
    }

    public double getY1() {
        return y1;
    }

    public double getY2() {
        return y2;
    }

    public String getColor() {
        return color;
    }
}