// --------------------------------------------------
Application = Object.SubClass();

// --------------------------------------------------
Application.prototype.__Constructor = function(canvasId)
{
	this.__canvas = document.getElementById(canvasId);
	this.__context = this.__canvas.getContext("2d");
    this.__images = new Map();
	this.__sprites = new Map();
	this.__lastFrameTime = Date.now();
    this.__loadedImages = 0;
	this.__loadedSprites = 0;
    this.__onResizeCallbacks = [];
    window.addEventListener("resize", this.OnResize.bind(this));
};

// --------------------------------------------------
Application.prototype.OnStart = function()
{
};

// --------------------------------------------------
Application.prototype.OnResize = function(e)
{
    for (var i = 0; i < this.__onResizeCallbacks.length; i++)
        this.__onResizeCallbacks[i].call(e);
};

// --------------------------------------------------
Application.prototype.AddOnResizeCallback = function(callback)
{
    this.__onResizeCallbacks.push(callback);
};

// --------------------------------------------------
Application.prototype.LoadImages = function(aliases)
{
    for (var i = 0; i < aliases.length; i++)
    {
        var alias = aliases[i];
        var image = new Image();
        image.onload = this.__OnImageLoad.bind(this);
        this.__images.Insert(alias.name, image);
    }

    this.__loadedImages = 0;
    for (var i = 0; i < aliases.length; i++)
    {
        var alias = aliases[i];
        var image = this.__images.Find(alias.name);
        image.src = alias.src;
    }
};

// --------------------------------------------------
Application.prototype.LoadSprites = function(sprites)
{
	for (var i = 0; i < sprites.length; i++)
	{
		var sprite = sprites[i];
		sprite.OnLoad = this.__OnSpriteLoad.bind(this);
		this.__sprites.Insert(sprite.GetName(), sprite);
	}
	
	this.__loadedSprites = 0;
	for (var i = 0; i < sprites.length; i++)
	{
		var sprite = sprites[i];
		sprite.Load();
	}
};

// --------------------------------------------------
Application.prototype.__OnImageLoad = function()
{
    this.__loadedImages++;
};

// --------------------------------------------------
Application.prototype.__OnSpriteLoad = function()
{
	this.__loadedSprites++;
};

// --------------------------------------------------
Application.prototype.__Update = function()
{
	this.__canvas.width = window.innerWidth;

	var currentTime = Date.now();
	
	var deltaTime = (currentTime - this.__lastFrameTime) / 1000.0;
	this.OnUpdate(deltaTime);
	
	this.__lastFrameTime = currentTime;

	System.AddAnimationCallback(this.__Update.bind(this));
};

// --------------------------------------------------
Application.prototype.OnUpdate = function(deltaTime)
{
};

// --------------------------------------------------
Application.prototype.ClearCanvas = function(canvas)
{
    if (typeof canvas == "undefined")
    {
        canvas = this.__canvas;
    }

    this.__context.clearRect(0, 0, canvas.width, canvas.height);
};

// --------------------------------------------------
Application.prototype.Run = function()
{
    if (this.__loadedImages != this.__images.GetSize() &&
        this.__loadedSprites != this.__sprites.GetSize())
    {
        window.setTimeout(this.Run.bind(this), 0.333);
    }
    else
    {
        this.OnStart();
        this.__Update();
    }
};