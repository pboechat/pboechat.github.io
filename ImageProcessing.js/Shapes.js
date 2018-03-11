// --------------------------------------------------
//                      BASE SHAPE
// --------------------------------------------------
Shape = Object.SubClass();

// --------------------------------------------------
Shape.prototype.__Constructor = function(x, y)
{
	this.__x = x;
	this.__y = y;
};

// --------------------------------------------------
Shape.prototype.GetX = function()
{
	return this.__x;
};

// --------------------------------------------------
Shape.prototype.GetY = function()
{
	return this.__y;
};

// --------------------------------------------------
//                      RECTANGLE
// --------------------------------------------------
Rectangle = Shape.SubClass();

// --------------------------------------------------
Rectangle.prototype.__Constructor = function(x, y, width, height)
{
	Shape.prototype.__Constructor.call(this, x, y);
	this.__width = width;
	this.__height = height;
};

// --------------------------------------------------
Rectangle.prototype.GetWidth = function()
{
	return this.__width;
};

// --------------------------------------------------
Rectangle.prototype.GetHeight = function()
{
	return this.__height;
};

// --------------------------------------------------
Rectangle.prototype.GetMinX = function()
{
	return this.__x;
};

// --------------------------------------------------
Rectangle.prototype.GetMinY = function()
{
	return this.__y;
};

// --------------------------------------------------
Rectangle.prototype.GetMaxX = function()
{
	return this.__x + this.__width;
};

// --------------------------------------------------
Rectangle.prototype.GetMaxY = function()
{
	return this.__y + this.__height;
};
