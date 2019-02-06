import {Component, Inject, OnDestroy, OnInit} from '@angular/core';

import {Task} from "../../../models/task";
import {IonicPage} from "ionic-angular";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {tap} from "rxjs/operators";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Subscription} from "rxjs/index";
import {ValidateVideo} from "../../../validations/videourl";
import {EmbedVideoService} from "ngx-embed-video/dist";

@IonicPage()
@Component({
  selector: 'task-form',
  templateUrl: './taskform.html',
})
export class TaskFormPage implements OnInit, OnDestroy {
  taskForm: FormGroup;
  selectedNode: any;
  // Internal state
  private _state: 'loading' | 'synced' | 'created' | 'modified' | 'error';
  formDoc: Task;
  taskFormSub: Subscription = new Subscription();
  dropdown:number[] = [];

  constructor( @Inject(MAT_DIALOG_DATA) public data:any,
               private dialogRef: MatDialogRef<TaskFormPage>,
               private embedService: EmbedVideoService,
               private fb: FormBuilder) {}

  ngOnInit() {

    this.taskForm = this.fb.group({
      taskNo: [0, [
        Validators.required
      ]],
      description: ['', [
        Validators.required
      ]],
      video: ['', [
        ValidateVideo.bind(this)
      ]],
      name: ['', [
        Validators.required
      ]],
      questions: this.fb.array(  [this.prepareQuestionDetails])
    });

    this.selectedNode = this.data.payload;
    this.formDoc = this.selectedNode.data.payload;

    // Fix that strings are passed
    let taskNo = Number(this.formDoc.taskNo);
    delete this.formDoc.taskNo;
    this.formDoc.taskNo = taskNo;

    this.patchQuestions(this.formDoc);
    this.taskForm.patchValue(this.formDoc as any);
    this.taskForm.markAsPristine();
    this.getDropDown(this.data.dropdown);

    this.taskFormSub.add(this.taskForm.valueChanges
      .pipe(
        tap(change => {
          this.state = 'modified';
        })
      )
      .subscribe());
  }

  getDropDown(input: any[]) {
    let cleanArr:string[] = [];
    // Make all strings
    input.forEach(item => {
      if(typeof item === 'number') cleanArr.push(item.toString());
      else cleanArr.push(item);
    });
    for( let i = 1; this.dropdown.length < 15; i++) {
      if ( cleanArr.indexOf(i.toString()) < 0 )
        this.dropdown.push(i);
    }
    return;
  }

  // Form Specific expand or contract of the form so that it has the values that patchValue can fill
  patchQuestions(task: Task) {
    if(task.questions === undefined || task.questions === null) return;
    // for our form we have questions and then answers nested
    let questionArray:FormArray = this.taskForm.controls['questions'] as FormArray;

    task.questions.forEach((question, qIndex) => {
      if(questionArray.length <= qIndex ) {
        let newQuestionGroup:FormGroup = this.prepareQuestionDetails;

        // Now check answers for this question in task.
        this.patchAnswers(newQuestionGroup.controls['answers'] as FormArray, question.answers);

        questionArray.push(newQuestionGroup);
      }
      // Still must check answers length on this one.
      let fg:FormGroup = questionArray.controls[qIndex] as FormGroup
      let ansArr = fg.controls['answers'] as FormArray;
      this.patchAnswers(ansArr, question.answers)
    });

  }

  patchAnswers(formAnswers: FormArray, taskAnswers:any[]) {

    if(taskAnswers === undefined || taskAnswers === null) return;

    taskAnswers.forEach((answer, ansIndex) => {
      if(formAnswers.length <= ansIndex) {
        let newAnswerGroup:FormGroup = this.prepareAnswerDetails;
        formAnswers.push(newAnswerGroup);
      }
    });
  }

get prepareQuestionDetails(): FormGroup {
  return this.fb.group({
    questionText: new FormControl('', Validators.required),
    answers: this.fb.array([ this.prepareAnswerDetails ])
  });
}

get prepareAnswerDetails(): FormGroup {
  return this.fb.group({
    answerText: new FormControl('', Validators.required),
    correct: new FormControl( false )
  });
}
  get questionForms() {
    return this.taskForm.get('questions') as FormArray
  }

  getAnswerForms(question) {
    return question.get('answers') as FormArray
  }

  addQuestion() {
    const question = this.prepareQuestionDetails;

    this.questionForms.push(question);
  }

  addAnswer(question) {
    question.get('answers').push(this.prepareAnswerDetails);
  }

  deleteQuestion(i: number) {
    this.questionForms.removeAt(i);
  }

  deleteAnswer(question) {
    let answers = question.get('answers');
    answers.removeAt(answers.length - 1);
  }
  // Setter for state changes
  set state(val) {
    this._state = val;
  }

  enableSubmit() {
    if( this.taskForm.valid && this._state === 'modified')
      return false;

    return true;
  }

  onSubmit(e) {
    this.formDoc = this.taskForm.getRawValue();
    this.selectedNode.topic = this.formDoc.name;
    this.selectedNode.data.payload = this.formDoc;
    this.dialogRef.close(this.selectedNode);
  }

  deleteTask() {
    this.dialogRef.close('DELETE');
  }

  cancelUpdate() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.taskFormSub.unsubscribe();
  }
}
