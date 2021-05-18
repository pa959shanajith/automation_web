import React, { useState} from 'react';
import { Rnd } from "react-rnd";
import '../styles/SearchBox.scss'
import * as d3 from 'd3';

var idxSearch = 0
var nodeID ;
var drag;

/*Component SearchBox
  use: returns floating search box
  props: setCtScale,zoom
*/
const SearchBox = (props) => {
    const [inp,setInp] = useState (false)
    const [err,setErr] = useState(false)
    var filter = []
    const onSearch = (e) =>{
        if(nodeID)d3.select('#'+nodeID).classed('searched-node',false)
        var val = e.target.value
        const reg = /[^a-zA-Z0-9_]+/;
        if(val === '')return;
        if(reg.test(val)){
            setErr(true)
            return;
        }
        setErr(false)
        var elem = document.getElementsByClassName('ct-node-title');
        filter = [...elem].filter((e)=>e.innerHTML.toUpperCase().indexOf(val.toUpperCase())!==-1)
        if (filter.length === 0) {
            if (val !== '')
                setErr(true)
            return;
        }
        if (e.key === "Enter") {
            idxSearch = (idxSearch + 1) % filter.length;
        } else {
            idxSearch = 0;
        }
        nodeID = filter[idxSearch].parentElement.id
        var nodetf = filter[idxSearch].parentElement.attributes.transform.value
        var mptf =  d3.select('.ct-container').attr('transform')
        var s = d3.select('.mp__canvas_svg');
        var center = [parseFloat(s.style("width"))/2, parseFloat(s.style("height"))/2];
        var x_mptf = parseInt(mptf.split(/[()]/)[1].split(',')[0]);
        var y_mptf = parseInt(mptf.split(/[()]/)[1].split(',')[1]);
        var scale_mptf = 1; 
        var x_nodetf = parseInt(nodetf.split(/[()]/)[1].split(',')[0]);
        var y_nodetf = parseInt(nodetf.split(/[()]/)[1].split(',')[1]);
        //Approx cordinates of node: mindmap translate + nodetf/mpscale
        var ccord = [x_mptf + (x_nodetf / scale_mptf), y_mptf + (y_nodetf / scale_mptf)];
        var x = x_mptf - ccord[0] + center[0] - 40
        var y = y_mptf - ccord[1] + center[1] - 20
        props.zoom.scale(scale_mptf).translate([x,y])
        // props.zoom.event(d3.select('#ct-mindMap'));
        d3.select('.ct-container').attr("transform", "translate(" +x+','+y+ ")scale(" + 1 + ")");
        d3.select('#'+nodeID).classed('searched-node',!0)
        props.setCtScale({x:x,y:y,k:1})
    }
    return(
        <Rnd enableResizing={false} default={{x:10,y:10}} bounds="parent">
            <div id="search-canvas-icon" data-test='SearchCanvas'>
                <img data-test="searchIcon" alt="Search Icon" onClick={(e)=>{
                    if(drag){drag=false; return;}
                    setInp(!inp)}
                    } 
                className="searchimg-canvas" src="static/imgs/ic-search-icon.png"/>
                <input data-test="searchBox" type="text" onKeyPress={(e)=>{if(e.key==='Enter')onSearch(e)}} onChange={(e)=>onSearch(e)} className={"search-canvas"+(inp?" search-visible":"")+(err?" inputErrorBorderFull":"")} placeholder="Search Node.."/>
            </div>
        </Rnd>

    )
}

export default SearchBox;