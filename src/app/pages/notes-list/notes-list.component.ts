import { style, transition, trigger,animate,query, stagger } from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Note } from 'src/app/shared/note.model';
import { NotesService } from 'src/app/shared/notes.service';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss'],
  animations:[
    trigger('itemAnim',[
      transition('void => *',[
         style({
          height:0,
          opacity:0,
          transform:'scale(0.85)',
          'margin-bottom':0,
          paddingTop:0,
          paddingBottom:0,
          paddingRight:0,
          paddingLeft:0
         }),
         animate('50ms', style({
          height:'*',
          'margin-bottom':'*',
          paddingTop:'*',
          paddingBottom:'*',
          paddingRight:'*',
          paddingLeft:'*'
         })),
         animate(68)
      ]),
      transition('void => *',[
        animate('50ms', style({
          transform:'scale(1.05)'
        })),
        animate('50ms', style({
          transform:'scale(1)',
          opacity:0.75
        })),
        animate('120ms ease-out',style({
          transform:'scale(0.68)',
          opacity:0
        })),
        animate('120ms ease-out',style({
          paddingTop:0,
          paddingBottom:0,
          paddingRight:0,
          paddingLeft:0,
          height:0,
          'margin-bottom':'0'
        }))        
      ])     
    ]),
    trigger('listAnim',[
      transition('* => *', [
        query(':enter',[
          style({
            opacity:0,
            height:0
          }),
          stagger(100,[
            animate('0.2s ease')
          ])
        ],{
          optional:true
        })
      ])
    ])
  ]
})
export class NotesListComponent implements OnInit {
  notes:Note[]=new Array<Note>();
  filteredNotes : Note[]=new Array<Note>();
  @ViewChild('filterInput') filterInputElRef! : ElementRef<HTMLInputElement>
  constructor(private notesService:NotesService) { }

  ngOnInit(): void {
    this.notes= this.notesService.getAll();
    this.filter('');
  }

  deleteNote(note:Note){
    let noteId = this.notesService.getId(note);
    this.notesService.delete(noteId);
    this.filter(this.filterInputElRef.nativeElement.value);
  }

  generateNoteURL(note:Note){
    let noteId = this.notesService.getId(note);
    return '../'+noteId ;
  }

  handleInput(event: Event) {
    let value1 = (event.target as HTMLInputElement).value;
    this.filter(value1);
  } 
  filter(query:string){
    query=query.toLowerCase().trim();
    let allResults: Note[]=new Array<Note>();
    let terms: string[]=query.split(' ');
    terms = this.removeDuplicate(terms);
    terms.forEach(term =>{
       let results:Note[] = this.relevantNotes(term);
       allResults=[...allResults, ...results];
    })
    //all results will include duplicate notes because all results will be sum of many search term

    let uniqueResults = this.removeDuplicate(allResults);
    this.filteredNotes = uniqueResults;
    this.sortByRelevancy(allResults);
  }
  removeDuplicate(arr:Array<any>):Array<any>{
    let uniqueResults : Set<any> = new Set<any>();
    arr.forEach(e => uniqueResults.add(e));
    return Array.from(uniqueResults);
  }
  relevantNotes(query:string): Array<Note>{
    query=query.toLowerCase().trim();
    let relevantNotes = this.notes.filter(note => {
      if(note.title && note.title.toLowerCase().includes(query)){
        return true;
      }
      if(note.body && note.body.toLowerCase().includes(query)){
        return true;
      }
      else{
        return false;
      }
    })
    return relevantNotes;
  }

  sortByRelevancy(searchResults: Note[]){
    let noteCountObj: {
      [v:number]: number;
  }={}; //format - key:value => NoteId:number (note object id : count)
    searchResults.forEach(note =>{
      let noteId= this.notesService.getId(note);

      if(noteCountObj && noteCountObj[noteId]){
        noteCountObj[noteId] += 1;
      }
      else{
        noteCountObj[noteId] = 1;
     
      }
    })

    this.filteredNotes=this.filteredNotes.sort((a:Note, b:Note) => {
      let aId = this.notesService.getId(a);
      let bId = this.notesService.getId(b);
      let aCount = noteCountObj[aId];
      let bCount = noteCountObj[bId];
      return bCount - aCount;
    })
  }
}
