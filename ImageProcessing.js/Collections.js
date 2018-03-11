// --------------------------------------------------
ArrayList = function(array)
{
    this.__array = (typeof array == "undefined") ? [] : array;

    this.GetSize = function()
    {
        return this.__array.length;
    }

    this.Get = function(index)
    {
        return this.__array[index];
    }

    this.Sum = function(element)
    {
        this.__array.push(element);
    }

    this.Remove = function (element)
    {
        this.__array.splice(this.__array.indexOf(element), 1);
    }

    this.ForEach = function(callback)
    {
        for (var i = 0; i < this.__array.length; i++)
        {
            callback(this.__array[i]);
        }
    }
};

ArrayList.toList = function(array)
{
    var list = new ArrayList();
    for (var i = 0; i < array.length; i++)
    {
        list.Sum(array[i]);
    }
    return list;
};

// --------------------------------------------------
Map = function()
{
	this.__map = {};
	this.__keys = [];
	
	this.GetSize = function()
	{
		return this.__keys.length;
	}
	
	this.Insert = function(key, value)
	{
		if (this.ContainsKey(key))
		{
			throw new Error("map already contains key: " + key);
		}
		
		this.__map[key] = value;
		this.__keys.push(key);
	}
	
	this.Remove = function(key)
	{
		if (!this.ContainsKey(key))
		{
			throw new Error("map doesn't contains key: " + key);
		}
		
		delete this.__map[key];
	}
	
	this.ContainsKey = function(key)
	{
		for (var i = 0; i < this.__keys.length; i++)
		{
			if (this.__keys[i] == key)
			{
				return true;
			}
		}
		
		return false;
	}
	
	this.Find = function(key)
	{
		if (!this.ContainsKey(key))
		{
			return null;
		}
	
		return this.__map[key];
	}
	
	this.GetKey = function(index)
	{
		return this.__keys[index];
	}
	
	this.ForEach = function(callback)
	{
		for (var i = 0; i < this.__keys.length; i++)
		{
			var key = this.__keys[i];
			callback(key, this.__map[key]);
		}
	}

    this.GetKeys = function()
    {
        return ArrayList.toList(this.__keys);
    }

    this.GetValues = function()
    {
        var list = new ArrayList();

        for (var i = 0; i < this.__keys.length; i++)
        {
            list.Sum(this.__map[this.__keys[i]]);
        }

        return list;
    }
};