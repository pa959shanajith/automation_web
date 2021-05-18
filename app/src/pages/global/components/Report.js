const Report = `<style>
        body{font-family: 'LatoWeb', sans-serif; height: 98%; margin: 0;}
        .mainContainer{
                float: left;
                padding: 5px;
                width: calc(100% - 12px);
        }
        .leftSummary{width: 50%; float: left; padding: 25px 0 25px 25px; font-size: 14px;}
        .leftSummary label{
                text-align: left;
                float: left;
                width: 29%;
                padding-right: 5px;
                padding-bottom: 5px;
        }
        .leftSummary span{
                float: left;
                width: 64%;
                padding-bottom: 5px;
                font-weight: bold;
        }
        .midContainer{
                border-collapse: collapse;
                border: 1px solid #cfcfcf;
                width: 100%;
                float: left;
                margin: 1% 0;
                font-size: 14px;
        }
        .midContainer td{padding-top: 5px; border: 1px solid #cfcfcf;float: left;}
        .midContainer td label{
                text-align: right;
                float: left;
                width: 35%;
                font-family: 'LatoWeb',sans-serif;
                padding-right: 5px;
                padding-bottom: 5px;
        }
        .reportsDetails{border: 1px solid #cfcfcf;     background-color: #dfd0fa; font-size: 15px;}
        .reportsDetails th:nth-child(1),.rDid{width: 4%;  word-break: break-word; }
        .reportsDetails th:nth-child(2),.rDstep{width: 5%;  word-break: break-word;}
        .reportsDetails th:nth-child(3),.rDstepDes{width: 12%; word-break: break-word; text-align:left}
        .reportsDetails th:nth-child(4),.rDstatus{width: 5%; word-break: break-word; text-align:left}
        .reportsDetails th:nth-child(5),.rDellaps{width: 5.5%; word-break: break-word; text-align:left}
        .reportsDetails th:nth-child(6),.rDcomments{width: 9%; word-break: break-word; text-align:left}
        .reportsDetails th:nth-child(7),.rDremarks{width: 9%; word-break: break-word; text-align:left}
        .reportsDetails th:nth-child(8),.rDActualRes{width: 9%; word-break: break-word; text-align:left}
        .reportsDetails th:nth-child(9),.rDExpectedRes{width: 7%; word-break: break-word; text-align:left}
        .maintabCont{float: left; width: 100%; border: 1px solid #dcdcdc;}
        .tabCont{display: table-cell; border-bottom: 1px solid #ececec; border-right: 1px solid #ececec;word-wrap:break-word}
        .reportsDetail{line-height: 2; text-align: center; height: calc(100% - 35px); overflow: auto;font-size: 14px;}
        .reportsDetail tr { page-break-inside: avoid; }
        .rDstepDes{text-align: left; word-break: break-word;}
        .reportsDetail tr.reportdetailsrow:nth-child(even){background: #d9d9d9;}
        .reportdetailsrow td{padding-top: 9px;}
        @media screen and (max-height: 675px) {
                .reportsDetail{
                        height: 174px;
                }
        }
        .reportsDetails th
        {
                text-align: center !important;
                padding: 8px;
                width: 10%;
        }
        .reportsDetails td
        {
                text-align: left !important;
                padding: 2px;
                width: 10%;
        }	
        .pdfReport{
                float:left;
                width: 100%;
                table-layout: table;
        }
        .latobold{
                font-weight: bold;
        }
</style>


<div class="mainContainer" >
        {{#each name}}

        <div class="leftSummary">
                <h3>Details</h3>
                <label>Testcase Name</label><span>: {{testcasename}}</span><br/>
        </div>
        {{/each}}
        <div class="maintabCont">
                <table class='pdfReport' style="width: 100%;" >
                        <thead class="reportsDetails">
                                <tr><th>Sl. No.</th>
                                        <th>Object Name</th>
                                        <th>Keyword</th>
                                        <th>Input</th>
                                        <th>Output</th></tr>
                        </thead>
                        <tbody class="reportsDetail" >
                                {{#each rows}}
                                    <tr style="width: 100%;" class="reportdetailsrow">
                                        <td>{{stepNo}}</td>
                                        <td>{{custname}}</td>
                                        <td>{{keywordVal}}</td>
                                        <td>{{inputVal}}</td>
                                        <td>{{outputVal}}</td>
                                    </tr>                

                                {{/each}}
                        </tbody>
                </table>

        </div>
</div>`

export default Report;