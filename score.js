function calculate(answers, questions) {
 const correct=answers.map((a,i)=>Number(a.choice===questions[i].answer));
 const accuracy=100*correct.reduce((s,y)=>s+y,0)/answers.length;
 const confidence=answers.reduce((s,a)=>s+a.confidence,0)/answers.length;
 const score=Math.round(100*(1-answers.reduce((s,a,i)=>s+(a.confidence/100-correct[i])**2,0)/answers.length));
 return {score,accuracy,confidence,correct,count:correct.reduce((s,y)=>s+y,0),level:score<=33?0:score<=66?1:2,bias:confidence-accuracy};
}
if(typeof module!=='undefined') module.exports={calculate};
