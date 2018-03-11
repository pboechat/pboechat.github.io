Sprite = Object.SubClass();

// --------------------------------------------------
Sprite.prototype.__Constructor = function(name, x, y, width, height, sources, duration)
{
    Assert.NotEmpty(name);
    Assert.NotEmpty(sources);
    Assert.GreaterThanZero(width);
    Assert.GreaterThanZero(height);

	this.__name = name;
	this.__x = x;
	this.__y = y;
	this.__sources = sources;
	this.__duration = duration;
	this.__frameDuration = (this.__sources.length < 2) ? 0 : this.__duration / this.__sources.length;
	this.__width = width;
	this.__height = height;
	this.__frames = [];
	this.__loadedImages = 0;
	this.__currentFrameIndex = 0;
	this.__elapsedTime = 0;
};

// --------------------------------------------------
Sprite.prototype.Clone = function()
{
	var clone = new Sprite(this.__name, this.__x, this.__y, this.__width, this.__height, this.__sources, this.__duration);
	clone.__frames = this.__frames;
	return clone;
};

// --------------------------------------------------
Sprite.prototype.GetName = function()
{
	return this.__name;
};
	
// --------------------------------------------------
Sprite.prototype.GetCurrentFrame = function()
{
	return this.__frames[this.__currentFrameIndex];
};

// --------------------------------------------------
Sprite.prototype.GetX = function()
{
	return this.__x;
};

// --------------------------------------------------
Sprite.prototype.GetY = function()
{
	return this.__y;
};

// --------------------------------------------------
Sprite.prototype.SetX = function(x)
{
	this.__x = x;
};

// --------------------------------------------------
Sprite.prototype.SetY = function(y)
{
	this.__y = y;
};

// --------------------------------------------------
Sprite.prototype.GetWidth = function()
{
	return this.__width;
};

// --------------------------------------------------
Sprite.prototype.GetHeight = function()
{
	return this.__height;
};

// --------------------------------------------------
Sprite.prototype.Move = function(x, y)
{
	this.__x += x;
	this.__y += y;
};

// --------------------------------------------------
Sprite.prototype.GetBounds = function()
{
	return new Rectangle(this.__x, this.__y, this.__width, this.__height);
};

// --------------------------------------------------
Sprite.prototype.Update = function(deltaTime)
{
	if (this.__sources.length < 2)
	{
		return;
	}

	this.__elapsedTime += deltaTime;
		
	if (this.__elapsedTime >= this.__frameDuration)
	{
		this.__currentFrameIndex = ++this.__currentFrameIndex % this.__frames.length;
		this.__elapsedTime -= this.__frameDuration;
	}
};

// --------------------------------------------------
Sprite.prototype.Load = function()
{
	for (var i = 0; i < this.__sources.length; i++)
	{
		var image = new Image();
		image.onload = this.__OnImageLoad.bind(this);
		image.width = this.__width;
		image.height = this.__height;
		this.__frames.push(image);
	}
	
	this.__loadedImages = 0;
	for (var i = 0; i < this.__sources.length; i++)
	{
		this.__frames[i].src = this.__sources[i];
	}
};

// --------------------------------------------------
Sprite.prototype.__OnImageLoad = function()
{
	if (++this.__loadedImages == this.__frames.length)
	{
		this.OnLoad();
	}
};

// --------------------------------------------------
Sprite.prototype.OnLoad = function()
{
}