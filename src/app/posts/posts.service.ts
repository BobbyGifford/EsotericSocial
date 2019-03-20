import {PostModel} from './post.model';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Subject} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: PostModel[] = [];
  private postsUpdated = new Subject<PostModel[]>();

  constructor(private http: HttpClient) {
  }

  getPosts() {
    this.http.get<{ message: string, posts: any }>('http://localhost:3000/api/posts')
    // Changes _id to id to match field in PostModel
      .pipe(map((postData) => {
        return postData.posts.map(post => {
          return {
            title: post.title,
            content: post.content,
            category: post.category,
            id: post._id,
          };
        });
      }))
      .subscribe((transfromedPosts) => {
        this.posts = transfromedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostsUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(newPost: PostModel) {
    this.http.post<{ message: string, postId: string }>('http://localhost:3000/api/posts', newPost)
      .subscribe((res) => {
        newPost.id = res.postId;
        this.posts.push(newPost);
        this.postsUpdated.next([...this.posts]);
      });
  }

  deletePost(postId: string) {
    this.http.delete(`http://localhost:3000/api/posts/${postId}`).subscribe(() => {
      const updatedPosts = this.posts.filter((post) => post.id !== postId);
      this.posts = updatedPosts;
      this.postsUpdated.next([...this.posts]);
    });
  }
}
