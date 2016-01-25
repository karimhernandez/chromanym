# Chromanym
Suggest a name for that color.
> Utility which suggests a name for a given color by finding the closest matching named color. 

## Why
This is a simple tool to alleviate the need for divining variable names for colors in a project palette.  No more ```$color-bluish-white```, followed by ```$color-bluer-than-bluish-white```.

## Install
```
$ npm install --global chromanym
```

## Usage
```
$ chromanym <color>
```

###Some examples
```
$ chromanym 777777
boulder, #7a7a7a (approximate match to #777777)
```
```
$ chromanym fafafa
alabaster, #fafafa (exact match, ntc color list)
```
```
$chromanym 5f4457
eggplant, #614051 (aproximate match to #5f4457)
```

## Thanks
To Zeke for his [color-namer](https://github.com/zeke/color-namer) package, which measures the supplied color against several dictionaries of named colors.

## License

MIT © 2016 Karim Hernandez