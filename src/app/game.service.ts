import { Injectable } from '@angular/core';
import { Game } from './game';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { MessageService } from './message.service';
@Injectable({
  providedIn: 'root'
})

export class GameService {
    private gamesUrl = 'api/games';  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  getGames(): Observable<Game[]> {
    return this.http.get<Game[]>(this.gamesUrl)
      .pipe(
        tap(_ => this.log('fetched games')),
        catchError(this.handleError<Game[]>('getGames', []))
      );
  }

  getGameNo404<Data>(id: number): Observable<Game> {
    const url = `${this.gamesUrl}/?id=${id}`;
    return this.http.get<Game[]>(url)
      .pipe(
        map(games => games[0]), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? 'fetched' : 'did not find';
          this.log(`${outcome} game id=${id}`);
        }),
        catchError(this.handleError<Game>(`getGame id=${id}`))
      );
  }

  getGame(id: number): Observable<Game> {
    const url = `${this.gamesUrl}/${id}`;
    return this.http.get<Game>(url).pipe(
      tap(_ => this.log(`fetched game id=${id}`)),
      catchError(this.handleError<Game>(`getGame id=${id}`))
    );
}
searchGames(term: string): Observable<Game[]> {
  if (!term.trim()) {
    // if not search term, return empty hero array.
    return of([]);
  }
  return this.http.get<Game[]>(`${this.gamesUrl}/?name=${term}`).pipe(
    tap(x => x.length ?
       this.log(`found games matching "${term}"`) :
       this.log(`no games matching "${term}"`)),
    catchError(this.handleError<Game[]>('searchGames', []))
  );
}

addGame(game: Game): Observable<Game> {
  
  return this.http.post<Game>(this.gamesUrl, game, this.httpOptions).pipe(
    tap((newGame: Game) => this.log(`added game w/ id=${newGame.id}`)),
    catchError(this.handleError<Game>('addGame'))
  );
}


deleteGame(id: number): Observable<Game> {
  const url = `${this.gamesUrl}/${id}`;

  return this.http.delete<Game>(url, this.httpOptions).pipe(
    tap(_ => this.log(`deleted game id=${id}`)),
    catchError(this.handleError<Game>('deleteGame'))
  );
}

updateGame(game: Game): Observable<any> {
  return this.http.put(this.gamesUrl, game, this.httpOptions).pipe(
    tap(_ => this.log(`updated game id=${game.id}`)),
    catchError(this.handleError<any>('updateGame'))
  );
}

private handleError<T>(operation = 'operation', result?: T) {
  return (error: any): Observable<T> => {

    // TODO: send the error to remote logging infrastructure
    console.error(error); // log to console instead

    // TODO: better job of transforming error for user consumption
    this.log(`${operation} failed: ${error.message}`);

    // Let the app keep running by returning an empty result.
    return of(result as T);
  };
}

private log(message: string) {
  this.messageService.add(`GameService: ${message}`);
}
}