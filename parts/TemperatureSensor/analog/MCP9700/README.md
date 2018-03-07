Tempe# Temperature Sensor - MCP9700





![photo of AnalogTempratureSensor](./wired.png)




## wired(obniz, {vcc, gnd, output})
```javascript
var tempsens = obniz.wired("MCP9700", { gnd:0 , output:1, vcc:2});
```

## onchange
callback function for temperature change.
Unit of temp is Celsius

```javascript
var tempsens = obniz.wired("MCP9700",   { gnd:0 , output:1, vcc:2});
tempsens.onchange = function(temp){
console.log(temp)
};
```
 
